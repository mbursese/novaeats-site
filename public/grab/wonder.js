/* Nova-hosted Wonder cart grabber */
(function(){
var B="https://wonder-cart-server-production.up.railway.app";
var HMAC_KEY_B64="NmMyZWI5MjQtY2ZmMi00MTVkLWEyZGUtYmU5ZmZlZTE5NTEyCg==";
var HOST="www.wonder.com";
var DESKTOP_MODE=!!window.__WONDER_DESKTOP_GRABBER__;
var DEBUG_SOURCES=[];

var el=null;
if(!DESKTOP_MODE){
  el=document.createElement("div");
  el.style.cssText="position:fixed;top:16px;left:50%;transform:translateX(-50%);min-width:280px;max-width:92vw;background:#11111d;color:#f7f7fa;padding:16px 20px;z-index:999999;text-align:center;font:600 15px/1.45 system-ui,sans-serif;border:1px solid rgba(248,192,0,.45);border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.5)";
  el.textContent="Nova · grabbing cart…";
  document.body.appendChild(el);
}

function showError(msg){
  if(!el)return;
  el.textContent=msg;
  el.style.background="#1a1012";
  el.style.borderColor="rgba(237,66,69,.7)";
}

function showCode(code,count,name){
  if(!el)return;
  el.innerHTML="<div style=font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#f8c000>Nova · cart code</div><div style=letter-spacing:3px;font-size:28px;font-weight:700;margin:8px 0 4px;color:#f8c000>"+code+"</div><small style=color:#9999aa>"+count+" items from "+name+"</small>";
  el.style.background="#11111d";
  el.style.borderColor="rgba(248,192,0,.7)";
}

function fail(msg){
  showError(msg);
  return {success:false,error:msg};
}

function requestId(){
  var c=typeof crypto!=="undefined"?crypto:null;
  if(c&&typeof c.randomUUID==="function")return c.randomUUID();
  var bytes=new Uint8Array(16);
  if(c&&c.getRandomValues)c.getRandomValues(bytes);
  else for(var i=0;i<bytes.length;i++)bytes[i]=Math.floor(Math.random()*256);
  bytes[6]=(bytes[6]&15)|64;
  bytes[8]=(bytes[8]&63)|128;
  var hex=[];
  for(var j=0;j<bytes.length;j++)hex.push((bytes[j]+256).toString(16).slice(1));
  return hex.slice(0,4).join("")+"-"+hex.slice(4,6).join("")+"-"+hex.slice(6,8).join("")+"-"+hex.slice(8,10).join("")+"-"+hex.slice(10).join("");
}

function readMeta(id){
  try{var s=JSON.parse(sessionStorage.getItem("__wonder_cart_meta")||"{}");return s[id]||{};}
  catch(e){return{};}
}

function readLineMeta(id){
  if(!id)return{};
  try{var s=JSON.parse(sessionStorage.getItem("__wonder_cart_line_meta")||"{}");return s[id]||{};}
  catch(e){return{};}
}

function cartLineId(row,mi){
  var rowKeys=["cart_item_id","cartItemId","cart_item_uuid","cartItemUuid","checkout_item_id","checkoutItemId","line_item_id","lineItemId","item_uuid","itemUuid","uuid"];
  var itemKeys=["cart_item_id","cartItemId","cart_item_uuid","cartItemUuid","checkout_item_id","checkoutItemId","line_item_id","lineItemId","item_uuid","itemUuid","uuid"];
  var sources=[{src:row,keys:rowKeys},{src:mi,keys:itemKeys}];
  for(var s=0;s<sources.length;s++){
    var src=sources[s].src;
    if(!src||typeof src!=="object")continue;
    for(var i=0;i<sources[s].keys.length;i++){
      var v=src[sources[s].keys[i]];
      if(v!=null&&typeof v!=="object")return String(v);
    }
  }
  return "";
}

function moneyAmount(v){
  if(v==null||v==="")return null;
  if(typeof v==="number"){
    var n=Math.abs(v)>=100?v/100:v;
    return Math.round(n*100)/100;
  }
  var p=Number(String(v).replace(/[$,]/g,"").trim());
  return isFinite(p)?Math.round(p*100)/100:null;
}

function subtotalFromSources(){
  var keys=["expected_subtotal","formatted_subtotal","subtotal","line_subtotal","formatted_line_subtotal","item_subtotal","formatted_item_subtotal","total_price","formatted_total_price","price_of_total_quantity","priceOfTotalQuantity","subtotal_cents","total_cents"];
  for(var s=0;s<arguments.length;s++){
    var src=arguments[s];
    if(!src||typeof src!=="object")continue;
    for(var i=0;i<keys.length;i++){
      var amount=moneyAmount(src[keys[i]]);
      if(amount!=null)return amount;
    }
  }
  return null;
}

function checkoutSubtotal(data){
  return subtotalFromSources(data&&data.price_summary,data);
}

function debugClone(value,depth,state){
  state=state||{count:0};
  if(value==null)return value;
  if(typeof value==="string")return value.length>600?value.slice(0,600)+"...":value;
  if(typeof value!=="object")return value;
  state.count++;
  if(state.count>900)return "[debug-truncated]";
  if(depth<=0)return Array.isArray(value)?"[array]":"[object]";
  if(Array.isArray(value)){
    return value.slice(0,24).map(function(v){return debugClone(v,depth-1,state);});
  }
  var out={};
  Object.keys(value).slice(0,80).forEach(function(k){
    if(/image|photo|picture|thumbnail|hero|logo|url/i.test(k))return;
    out[k]=debugClone(value[k],depth-1,state);
  });
  return out;
}

function debugRecord(label,data){
  try{
    DEBUG_SOURCES.push({label:label,data:debugClone(data,8)});
    DEBUG_SOURCES=DEBUG_SOURCES.slice(-8);
  }catch(e){}
}

function cartItemObjectsFromCheckout(co){
  var out=[];
  ((co&&co.cart_restaurants)||[]).forEach(function(v){
    ((v.checkout_items||v.cart_items)||[]).forEach(function(i){
      if(i&&(i.menu_item||i.bundle_item||i.item))out.push(i);
    });
  });
  return out;
}

function cartItemIds(items){
  var ids={};
  (items||[]).forEach(function(i){
    var mi=i&&(i.menu_item||i.bundle_item||i.item)||{};
    var id=mi.menu_item_id||mi.bundle_item_id||mi.item_id||mi.id||mi.global_menu_item_id||i.menu_item_id||i.bundle_item_id||i.item_id;
    if(id)ids[String(id)]=true;
  });
  return ids;
}

function deepFind(obj,keys){
  var wanted={};
  (keys||[]).forEach(function(k){wanted[k]=true;});
  var seen=[];
  function walk(v){
    if(!v||typeof v!=="object"||seen.indexOf(v)>=0)return "";
    seen.push(v);
    var ks=Object.keys(v);
    for(var i=0;i<ks.length;i++){
      var k=ks[i];
      if(wanted[k]&&v[k]!=null&&typeof v[k]!=="object")return String(v[k]);
    }
    for(var j=0;j<ks.length;j++){
      var found=walk(v[ks[j]]);
      if(found)return found;
    }
    return "";
  }
  return walk(obj);
}

function cloneValue(value){
  if(value==null)return value;
  try{return JSON.parse(JSON.stringify(value));}
  catch(e){return value;}
}

function hasStructuredValue(value){
  if(value==null)return false;
  if(Array.isArray(value))return value.length>0;
  if(typeof value==="object")return Object.keys(value).length>0;
  if(typeof value==="string")return value.trim().length>0;
  return true;
}

function pickStructuredValue(sources,keys){
  var seen=[];
  function walk(value){
    if(!value||typeof value!=="object"||seen.indexOf(value)>=0)return null;
    seen.push(value);
    for(var i=0;i<keys.length;i++){
      var key=keys[i];
      if(Object.prototype.hasOwnProperty.call(value,key)&&hasStructuredValue(value[key]))return cloneValue(value[key]);
    }
    var ks=Object.keys(value);
    for(var j=0;j<ks.length;j++){
      var found=walk(value[ks[j]]);
      if(hasStructuredValue(found))return found;
    }
    return null;
  }
  for(var i=0;i<(sources||[]).length;i++){
    var found=walk(sources[i]);
    if(hasStructuredValue(found))return found;
  }
  return null;
}

function comboSelections(){
  var sources=Array.prototype.slice.call(arguments).filter(Boolean);
  var out={};
  var paired=pickStructuredValue(sources,[
    "paired_menu_items","pairedMenuItems","paired_items","pairedItems",
    "combo_items","comboItems","selected_combo_items","selectedComboItems",
    "selected_items","selectedItems","bundle_items","bundleItems",
    "selected_bundle_items","selectedBundleItems"
  ]);
  var bundleOptions=pickStructuredValue(sources,[
    "bundle_item_selected_option_values","bundleItemSelectedOptionValues",
    "selected_bundle_option_values","selectedBundleOptionValues",
    "bundle_selected_option_values","bundleSelectedOptionValues",
    "selected_option_values","selectedOptionValues"
  ]);
  var choices=pickStructuredValue(sources,[
    "choices","Choices","selected_choices","selectedChoices",
    "choice_values","choiceValues","selected_choice_values","selectedChoiceValues",
    "choice_selections","choiceSelections","selected_choice_menu_items","selectedChoiceMenuItems"
  ]);
  if(hasStructuredValue(paired))out.paired_menu_items=paired;
  if(hasStructuredValue(bundleOptions))out.bundle_item_selected_option_values=bundleOptions;
  if(hasStructuredValue(choices))out.choices=choices;
  return out;
}

function optionPayload(){
  var sources=Array.prototype.slice.call(arguments).filter(Boolean);
  return pickStructuredValue(sources,[
    "options","selected_options","selectedOptions",
    "option_groups","optionGroups","selected_option_groups","selectedOptionGroups",
    "selected_option_values","selectedOptionValues",
    "cart_item_options","cartItemOptions","selected_menu_item_options","selectedMenuItemOptions",
    "modifiers","modifier_groups","modifierGroups",
    "selected_modifiers","selectedModifiers","selected_modifier_groups","selectedModifierGroups",
    "customizations","selected_customizations","selectedCustomizations",
    "customization_groups","customizationGroups","selected_customization_groups","selectedCustomizationGroups"
  ]);
}

function readEventLog(){
  try{
    var log=JSON.parse(sessionStorage.getItem("__wonder_cart_event_log")||"[]");
    if(!Array.isArray(log))return [];
    return log.slice(-20);
  }catch(e){return [];}
}

function findStore(){
  var els=document.querySelectorAll("body *");
  for(var j=0;j<els.length;j++){
    var keys=Object.keys(els[j]);
    for(var k=0;k<keys.length;k++){
      if(keys[k].startsWith("__reactFiber$")){
        var fiber=els[j][keys[k]],d=0;
        while(fiber&&d<300){
          var p=fiber.memoizedProps;
          if(p&&p.value&&p.value.store&&typeof p.value.store.getState=="function"){
            return p.value.store.getState();
          }
          fiber=fiber.return;d++;
        }
      }
    }
  }
  return null;
}

function readMenu(state){
  var m={};
  try{
    var info=(((state.app||{}).restaurant||{}).restaurantInfo||{}).menus||[];
    info.forEach(function(menu){
      (menu.categories||[]).forEach(function(cat){
        (cat.items||[]).forEach(function(it){
          indexMenuEntry(m,cat,it);
        });
      });
    });
  }catch(e){}
  return m;
}

function menuEntity(it){
  if(!it)return null;
  return it.menu_item||it.bundle_item||it.item||it;
}

function menuEntityId(mi){
  return mi&&(mi.id||mi.menu_item_id||mi.bundle_item_id||mi.item_id||mi.global_menu_item_id||"");
}

function menuEntityName(mi){
  return mi&&(mi.item_name||mi.menu_item_name||mi.name||mi.display_name||"");
}

function menuEntityVariation(mi){
  var v=mi&&(mi.variation||mi.menu_item_variation||mi.selected_variation||{});
  var vs=mi&&(mi.variations||mi.menu_item_variations||[]);
  var first=Array.isArray(vs)?vs[0]:null;
  var nested=deepFind(mi,["variation_id","variationId","menu_item_variation_id","menuItemVariationId","selected_variation_id","selectedVariationId","selected_menu_item_variation_id","selectedMenuItemVariationId","quick_add_variation_id","quickAddVariationId","default_variation_id","defaultVariationId","default_menu_item_variation_id","defaultMenuItemVariationId"]);
  return mi&&(mi.quick_add_variation_id||mi.quickAddVariationId||mi.variation_id||mi.variationId||mi.menu_item_variation_id||mi.menuItemVariationId||mi.selected_variation_id||mi.selectedVariationId||mi.selected_menu_item_variation_id||mi.selectedMenuItemVariationId||mi.default_variation_id||mi.defaultVariationId||mi.default_menu_item_variation_id||mi.defaultMenuItemVariationId||v.id||v.variation_id||v.variationId||v.menu_item_variation_id||v.menuItemVariationId||(first&&(first.id||first.variation_id||first.variationId||first.menu_item_variation_id||first.menuItemVariationId))||nested||"");
}

function indexMenuEntry(map,cat,it){
  var mi=menuEntity(it);
  var id=menuEntityId(mi);
  if(!id)return;
  var prev=map[id]||{};
  var catId=cat.id||cat.category_id||cat.category_run_id||"";
  var realCat=cat.type!=="POPULAR"&&(cat.id||cat.category_id);
  var useCat=!prev.category_id||(!prev._real_category&&realCat);
  map[id]={
    category_id:useCat?catId:prev.category_id,
    category_name:useCat?(cat.name||cat.category_name||prev.category_name||""):prev.category_name,
    _real_category:prev._real_category||!!realCat,
    item_name:prev.item_name||menuEntityName(mi),
    quickAddVariationId:prev.quickAddVariationId||menuEntityVariation(mi)
  };
}

async function hmac(method,path,ts,params){
  var d=[],k=Object.keys(params||{}).sort();
  for(var i=0;i<k.length;i++){d.push(encodeURIComponent(k[i])+"="+encodeURIComponent(params[k[i]]));}
  var qs=d.join("&");
  var msg=method.toLowerCase()+"\n"+HOST+"\n"+path+"\n"+ts;
  if(qs)msg+="\n"+qs;
  var kb=Uint8Array.from(atob(HMAC_KEY_B64),function(c){return c.charCodeAt(0);});
  var ck=await crypto.subtle.importKey("raw",kb,{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  var sig=await crypto.subtle.sign("HMAC",ck,new TextEncoder().encode(msg));
  var b="";new Uint8Array(sig).forEach(function(x){b+=String.fromCharCode(x);});
  return btoa(b);
}

async function fetchMenu(storeId,debugIds){
  var p={service_fee_user_variant:"VARIANT_A",time_zone:"America/New_York"};
  var ts=Date.now();
  var h=await hmac("GET","/order/ajax/restaurant/"+storeId,ts,p);
  var r=await fetch("/order/ajax/restaurant/"+storeId+"?"+Object.keys(p).map(function(k){return k+"="+encodeURIComponent(p[k]);}).join("&"),{
    credentials:"include",
    headers:{"x-hmac":h,"x-timestamp":String(ts),"x-request-id":requestId()}
  });
  var d=await r.json();
  var m={};
  var debugItems=[];
  (d.menus||[]).forEach(function(menu){
    (menu.categories||[]).forEach(function(cat){
      (cat.items||[]).forEach(function(it){
        indexMenuEntry(m,cat,it);
        var mi=menuEntity(it);
        var id=menuEntityId(mi);
        if(id&&debugIds&&debugIds[String(id)]){
          debugItems.push({category:{id:cat.id||cat.category_id||"",name:cat.name||cat.category_name||""},item:it});
        }
      });
    });
  });
  if(debugItems.length)debugRecord("restaurant_menu_items",debugItems);
  return m;
}

async function fetchCartBanner(){
  var ts=Date.now();
  var h=await hmac("GET","/order/ajax/cart/banner",ts);
  var r=await fetch("/order/ajax/cart/banner",{
    credentials:"include",
    headers:{"x-hmac":h,"x-timestamp":String(ts),"x-request-id":requestId()}
  });
  var d=await r.json();
  debugRecord("cart_banner",d);
  var items={};
  items.__items=[];
  var summary=d.cart_summary||{};
  var rv=(summary.restaurant_views||[]).concat(summary.cart_restaurants||[]);
  rv.forEach(function(v){
    (v.items||[]).forEach(function(it){
      var id=it&&(it.item_id||it.menu_item_id||it.bundle_item_id);
      var lineId=cartLineId(it,it&&(it.menu_item||it.bundle_item||it.item));
      if(id){
        var payload=Object.assign({
          variation_id:it.variation_id||it.variationId||it.menu_item_variation_id||it.menuItemVariationId||"",
          options:Array.isArray(it.options)?it.options:[],
          expected_subtotal:subtotalFromSources(it)
        },comboSelections(it));
        payload.cart_item_id=lineId||"";
        payload.item_id=String(id);
        items.__items.push(payload);
        items[id]=payload;
        if(lineId)items[lineId]=payload;
      }
    });
  });
  return items;
}

function takeBannerPayload(banner,itemId,lineId,used){
  banner=banner||{};
  used=used||{};
  if(lineId&&lineId!==itemId&&banner[lineId]){
    used[lineId]=true;
    return banner[lineId];
  }
  var list=Array.isArray(banner.__items)?banner.__items:[];
  for(var i=0;i<list.length;i++){
    var entry=list[i];
    if(!entry||String(entry.item_id)!==String(itemId))continue;
    var key=entry.cart_item_id||String(itemId)+"#"+i;
    if(used[key])continue;
    used[key]=true;
    return entry;
  }
  return banner[itemId]||{};
}

async function fetchCheckout(){
  var ts=Date.now();
  var h=await hmac("GET","/order/ajax/checkout",ts);
  var r=await fetch("/order/ajax/checkout",{
    credentials:"include",
    headers:{"x-hmac":h,"x-timestamp":String(ts),"x-request-id":requestId()}
  });
  var d=await r.json();
  debugRecord("checkout_items",cartItemObjectsFromCheckout(d));
  return d;
}

function readItemQuantity(row,mi){
  var vals=[
    row&&row.quantity,
    row&&row.item_quantity,
    row&&row.qty,
    row&&row.count,
    row&&row.selected_quantity,
    row&&row.total_quantity,
    mi&&mi.quantity,
    mi&&mi.item_quantity,
    mi&&mi.qty,
    mi&&mi.count,
    mi&&mi.selected_quantity,
    mi&&mi.total_quantity
  ];
  for(var i=0;i<vals.length;i++){
    var n=Number(vals[i]);
    if(isFinite(n)&&n>0)return Math.max(1,Math.floor(n));
  }
  return 1;
}

function cartItemKey(it){
  var opts="";
  var paired="";
  var bundleOptions="";
  var choices="";
  try{opts=JSON.stringify(it.options||[]);}catch(e){opts="";}
  try{paired=JSON.stringify(it.paired_menu_items||null);}catch(e){paired="";}
  try{bundleOptions=JSON.stringify(it.bundle_item_selected_option_values||null);}catch(e){bundleOptions="";}
  try{choices=JSON.stringify(it.choices||null);}catch(e){choices="";}
  return [
    it.cart_item_id||"",
    it.type||"",
    it.bundle_item_id||"",
    it.item_id||"",
    it.variation_id||"",
    it.category_id||"",
    it.category_name||"",
    it.special_instructions||"",
    it.expected_subtotal==null?"":String(it.expected_subtotal),
    opts,
    paired,
    bundleOptions,
    choices
  ].join("||");
}

function mergeDuplicateCartItems(items){
  var byKey={},out=[];
  (items||[]).forEach(function(it){
    if(!it||!it.item_id)return;
    it.quantity=readItemQuantity(it,it);
    var key=cartItemKey(it);
    if(byKey[key]){
      byKey[key].quantity+=it.quantity;
    }else{
      byKey[key]=it;
      out.push(it);
    }
  });
  return out;
}

function cartQuantity(items){
  return (items||[]).reduce(function(sum,it){return sum+readItemQuantity(it,it);},0);
}

function buildCartFromCheckout(co, banner, apiMenu){
  var views=(co.cart_restaurants||[]);
  if(!views.length)return null;
  var v=views[0];
  var citems=((v.checkout_items||v.cart_items)||[]).filter(function(i){return i.menu_item||i.bundle_item||i.item;});
  if(!citems.length)return null;
  var state=findStore();
  var rdxMenu=state?readMenu(state):{};
  banner=banner||{};
  apiMenu=apiMenu||{};
  var bannerUsed={};
  var items=citems.map(function(i){
    var mi=i.menu_item||i.bundle_item||i.item||{};
    var mid=mi.menu_item_id||mi.bundle_item_id||mi.item_id||mi.id||mi.global_menu_item_id||"";
    var lineId=cartLineId(i,mi);
    var meta=readMeta(mid);
    var lineMeta=readLineMeta(lineId);
    var m=apiMenu[mid]||rdxMenu[mid]||{};
    var b=takeBannerPayload(banner,mid,lineId,bannerUsed);
    var cat=mi.category||mi.menu_category||{};
    var vari=mi.variation||mi.menu_item_variation||mi.selected_variation||{};
    var vars=mi.variations||mi.menu_item_variations||[];
    var firstVar=Array.isArray(vars)?vars[0]:null;
    var rawType=String(i.type||i.item_type||i.itemType||meta.type||"").toUpperCase();
    var isBundle=rawType==="BUNDLE_ITEM"||!!i.bundle_item||!!mi.bundle_item_id||!!mi.bundle_item_name||!!meta.bundle_item_id;
    var itemName=meta.menu_item_name||meta.bundle_item_name||m.item_name||mi.menu_item_name||mi.bundle_item_name||mi.item_name||mi.name||"";
    var item=Object.assign({
      type:isBundle?"BUNDLE_ITEM":"MENU_ITEM",
      item_id:mid,
      cart_item_id:lineId||undefined,
      bundle_item_id:isBundle?(meta.bundle_item_id||mi.bundle_item_id||mid):undefined,
      bundle_item_name:isBundle?itemName:undefined,
      name:itemName,
      category_id:meta.category_id||m.category_id||mi.category_id||cat.id||cat.category_id||mi.category_run_id||"",
      category_name:meta.category_name||m.category_name||mi.category_name||cat.name||cat.category_name||"",
      variation_id:b.variation_id||b.variationId||b.menu_item_variation_id||b.menuItemVariationId||meta.variation_id||meta.variationId||i.variation_id||i.variationId||i.menu_item_variation_id||i.menuItemVariationId||i.selected_variation_id||i.selectedVariationId||i.selected_menu_item_variation_id||i.selectedMenuItemVariationId||vari.id||vari.variation_id||vari.variationId||vari.menu_item_variation_id||vari.menuItemVariationId||(firstVar&&(firstVar.id||firstVar.variation_id||firstVar.variationId||firstVar.menu_item_variation_id||firstVar.menuItemVariationId))||m.quickAddVariationId||mi.quick_add_variation_id||mi.quickAddVariationId||mi.variation_id||mi.variationId||mi.menu_item_variation_id||mi.menuItemVariationId||mi.selected_variation_id||mi.selectedVariationId||mi.selected_menu_item_variation_id||mi.selectedMenuItemVariationId||deepFind(i,["variation_id","variationId","menu_item_variation_id","menuItemVariationId","selected_variation_id","selectedVariationId","selected_menu_item_variation_id","selectedMenuItemVariationId","quick_add_variation_id","quickAddVariationId"])||deepFind(mi,["variation_id","variationId","menu_item_variation_id","menuItemVariationId","selected_variation_id","selectedVariationId","selected_menu_item_variation_id","selectedMenuItemVariationId","quick_add_variation_id","quickAddVariationId"])||"",
      quantity:readItemQuantity(i,mi),
      options:lineMeta.options||b.options||optionPayload(i,mi)||meta.options||[],
      special_instructions:i.special_instructions||i.specialInstructions||mi.special_instructions||mi.specialInstructions||lineMeta.special_instructions||""
    },comboSelections(i,mi,b,lineMeta,meta));
    var expected=subtotalFromSources(i,mi,lineMeta,b);
    if(expected!=null)item.expected_subtotal=expected;
    return item;
  });
  return {
    store_id:v.restaurant_id,
    store_name:(v.restaurant_name_view||{}).name||(v.restaurant_name_view||{}).nickname||"",
    brand_category:co.brand_category||co.restaurant_brand_category||"WONDER_LOCAL",
    address:(co.address||{}),
    expected_subtotal:checkoutSubtotal(co),
    debug_event_log:readEventLog(),
    debug_sources:DEBUG_SOURCES.slice(),
    items:mergeDuplicateCartItems(items)
  };
}

function finalizeWonderCart(cart){
  if(!cart||!Array.isArray(cart.items))return cart;
  if(cart.expected_subtotal==null){
    var total=0;
    (cart.items||[]).forEach(function(it){
      var amount=moneyAmount(it&&it.expected_subtotal);
      if(amount!=null)total+=amount;
    });
    if(total>0)cart.expected_subtotal=Math.round(total*100)/100;
  }
  if(cart.brand_category==="WONDER_HDR"){
    cart.items=cart.items.map(function(it){
      it.category_id=it.category_id||null;
      it.variation_id=it.variation_id||null;
      return it;
    });
  }
  return cart;
}

function missingWonderItemFields(cart){
  var brand=cart&&cart.brand_category;
  return ((cart&&cart.items)||[]).map(function(it){
    var fields=[];
    var rawType=String(it.type||it.item_type||it.itemType||"").toUpperCase();
    var isBundle=rawType==="BUNDLE_ITEM"||!!it.bundle_item_id||!!it.bundleItemId;
    if(!it.category_id&&!it.category_name)fields.push("category");
    if(!isBundle&&!it.variation_id&&brand!=="WONDER_HDR")fields.push("variation");
    return fields.length?{item:it,fields:fields}:null;
  }).filter(Boolean);
}

function buildCartFromRedux(state){
  var stateCart=(((state.app||{}).cart||{}).cartData||{});
  var views=(stateCart.restaurant_views||[]).concat(stateCart.cart_restaurants||[]);
  var cartData=views[0];
  if(!cartData)return null;
  var cartItems=(cartData.cart_items||[]).filter(function(i){return i.menu_item||i.bundle_item||i.item;});
  if(!cartItems.length)return null;
  var menu=readMenu(state);
  var items=cartItems.map(function(i){
    var mi=i.menu_item||i.bundle_item||i.item||{};
    var mid=mi.menu_item_id||mi.bundle_item_id||mi.item_id||mi.id||mi.global_menu_item_id||"";
    var lineId=cartLineId(i,mi);
    var meta=readMeta(mid);
    var lineMeta=readLineMeta(lineId);
    var m=menu[mid]||{};
    var cat=mi.category||mi.menu_category||{};
    var vari=mi.variation||mi.menu_item_variation||mi.selected_variation||{};
    var vars=mi.variations||mi.menu_item_variations||[];
    var firstVar=Array.isArray(vars)?vars[0]:null;
    var rawType=String(i.type||i.item_type||i.itemType||meta.type||"").toUpperCase();
    var isBundle=rawType==="BUNDLE_ITEM"||!!i.bundle_item||!!mi.bundle_item_id||!!mi.bundle_item_name||!!meta.bundle_item_id;
    var itemName=meta.menu_item_name||meta.bundle_item_name||m.item_name||mi.menu_item_name||mi.bundle_item_name||mi.item_name||mi.name||"";
    var item=Object.assign({
      type:isBundle?"BUNDLE_ITEM":"MENU_ITEM",
      item_id:mid,
      cart_item_id:lineId||undefined,
      bundle_item_id:isBundle?(meta.bundle_item_id||mi.bundle_item_id||mid):undefined,
      bundle_item_name:isBundle?itemName:undefined,
      name:itemName,
      category_id:meta.category_id||m.category_id||mi.category_id||cat.id||cat.category_id||mi.category_run_id||"",
      category_name:meta.category_name||m.category_name||mi.category_name||cat.name||cat.category_name||"",
      variation_id:meta.variation_id||meta.variationId||i.variation_id||i.variationId||i.menu_item_variation_id||i.menuItemVariationId||i.selected_variation_id||i.selectedVariationId||i.selected_menu_item_variation_id||i.selectedMenuItemVariationId||vari.id||vari.variation_id||vari.variationId||vari.menu_item_variation_id||vari.menuItemVariationId||(firstVar&&(firstVar.id||firstVar.variation_id||firstVar.variationId||firstVar.menu_item_variation_id||firstVar.menuItemVariationId))||m.quickAddVariationId||mi.quick_add_variation_id||mi.quickAddVariationId||mi.variation_id||mi.variationId||mi.menu_item_variation_id||mi.menuItemVariationId||mi.selected_variation_id||mi.selectedVariationId||mi.selected_menu_item_variation_id||mi.selectedMenuItemVariationId||deepFind(i,["variation_id","variationId","menu_item_variation_id","menuItemVariationId","selected_variation_id","selectedVariationId","selected_menu_item_variation_id","selectedMenuItemVariationId","quick_add_variation_id","quickAddVariationId"])||deepFind(mi,["variation_id","variationId","menu_item_variation_id","menuItemVariationId","selected_variation_id","selectedVariationId","selected_menu_item_variation_id","selectedMenuItemVariationId","quick_add_variation_id","quickAddVariationId"])||"",
      quantity:readItemQuantity(i,mi),
      options:lineMeta.options||optionPayload(i,mi)||meta.options||[],
      special_instructions:i.special_instructions||i.specialInstructions||mi.special_instructions||mi.specialInstructions||lineMeta.special_instructions||""
    },comboSelections(i,mi,lineMeta,meta));
    var expected=subtotalFromSources(i,mi,lineMeta);
    if(expected!=null)item.expected_subtotal=expected;
    return item;
  });
  var address=((state.app||{}).fulfillment||{}).address||{};
  var brand=stateCart;
  return {
    store_id:cartData.restaurant_id,
    store_name:(cartData.restaurant_name_view||{}).name||(cartData.restaurant_name_view||{}).nickname||"",
    brand_category:brand.brand_category||brand.restaurant_brand_category||"WONDER_LOCAL",
    expected_subtotal:checkoutSubtotal(stateCart),
    debug_event_log:readEventLog(),
    debug_sources:DEBUG_SOURCES.slice(),
    address:{
      street_number:address.street_number||"",
      address_short_name:address.address_short_name||"",
      unit_number_or_company:address.unit_number_or_company||"",
      drop_off_type:address.drop_off_type||"",
      city:address.city||"",state:address.state||"",county:address.county||"",
      zip_code:address.zip_code||"",zip_code_extension:address.zip_code_extension||"",
      latitude:address.latitude||0,longitude:address.longitude||0
    },
    items:mergeDuplicateCartItems(items)
  };
}

async function grab(){
  var cart=null;
  try{
    var co=await fetchCheckout();
    var banner=await fetchCartBanner();
    var views=co.cart_restaurants||[];
    if(!views.length)return fail("No cart found. Add items first.");
    var storeId=views[0].restaurant_id;
    var menu=await fetchMenu(storeId,cartItemIds(cartItemObjectsFromCheckout(co)));
    cart=finalizeWonderCart(buildCartFromCheckout(co, banner, menu));
  }catch(e){
    return fail("Failed to load cart data. Make sure you are logged in on wonder.com.");
  }

  if(!cart||!cart.items||!cart.items.length){
    return fail("Cart is empty.");
  }

  var missing=missingWonderItemFields(cart);
  if(missing.length){
    var details=missing.slice(0,3).map(function(m){
      var it=m.item;
      return (it.name||it.item_id||"item")+" ("+m.fields.join(", ")+")";
    }).join("; ");
    return fail("Missing data for "+missing.length+" item(s): "+details+". Refresh Wonder, remove/re-add the items, then try again.");
  }

  if(DESKTOP_MODE){
    return {success:true,cart:cart};
  }

  try{
    var itemCount=cartQuantity(cart.items);
    var resp=await fetch(B+"/api/v1/cart",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({label:cart.store_name+" - "+itemCount+" items",cart:cart,platform:"wonder"})
    });
    var data=await resp.json();
    if(data.code){
      showCode(data.code,itemCount,cart.store_name);
      return {success:true,code:data.code,cart:cart};
    }else{
      return fail("Upload failed: "+JSON.stringify(data));
    }
  }catch(e){
    return fail("Error: "+e.message);
  }
}

return grab();
})();
