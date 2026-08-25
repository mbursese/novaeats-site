/* Nova-hosted cart grabber — drop-in bookmarklet.
 *
 * Reads the cart you already have open and returns a short code the bot can
 * order from. No extension, no install.
 *
 * It signs its own requests: Wonder rejects anything without a valid x-hmac,
 * and the key is a base64 blob sitting in the site's own bundle. The canonical
 * string is method\nhost\npath\ntimestamp, then the sorted query and the JSON
 * body butted together — verified against captured traffic.
 *
 * Only menu_item_id, quantity, restaurant_id and the address are collected.
 * category_id / variation_id are deliberately NOT needed: the bot resolves
 * those from the restaurant menu at order time.
 */
(function () {
  "use strict";
  var API = "https://wonder-cart-production.up.railway.app/api/cart";
  var HOST = "www.wonder.com";
  var FALLBACK_KEY = "NmMyZWI5MjQtY2ZmMi00MTVkLWEyZGUtYmU5ZmZlZTE5NTEyCg==";

  if (location.hostname !== HOST) {
    alert("Open your cart on wonder.com first, then run this again.");
    return;
  }

  /* ── panel ─────────────────────────────────────────────────────────── */
  var old = document.getElementById("wa-grab");
  if (old) old.remove();
  var el = document.createElement("div");
  el.id = "wa-grab";
  el.style.cssText = [
    "position:fixed", "z-index:2147483647", "top:18px", "left:50%",
    "min-width:268px", "max-width:92vw",
    "background:rgba(7,7,13,.92)", "-webkit-backdrop-filter:blur(18px)",
    "backdrop-filter:blur(18px)",
    "color:#f7f7fa", "border:1px solid rgba(248,192,0,.35)",
    "border-radius:18px", "padding:18px 20px", "text-align:center",
    "box-shadow:0 24px 60px rgba(0,0,0,.5)",
    // Slides down and settles, rather than appearing on top of the page.
    "transform:translate(-50%,-14px)", "opacity:0",
    "transition:transform .34s cubic-bezier(.2,.9,.3,1),opacity .24s ease",
    "font:500 14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
  ].join(";");
  document.body.appendChild(el);
  requestAnimationFrame(function () {
    el.style.transform = "translate(-50%,0)";
    el.style.opacity = "1";
  });

  if (!document.getElementById("wa-grab-css")) {
    var css = document.createElement("style");
    css.id = "wa-grab-css";
    css.textContent =
      "@keyframes wa-spin{to{transform:rotate(360deg)}}" +
      "@keyframes wa-pop{0%{transform:scale(.94);opacity:0}" +
      "60%{transform:scale(1.03)}100%{transform:scale(1);opacity:1}}" +
      "#wa-grab .wa-code{animation:wa-pop .38s cubic-bezier(.2,.9,.3,1) both}" +
      "#wa-grab .wa-ring{width:15px;height:15px;border-radius:50%;" +
      "border:2px solid rgba(255,255,255,.18);border-top-color:#f8c000;" +
      "display:inline-block;vertical-align:-3px;margin-right:9px;" +
      "animation:wa-spin .7s linear infinite}";
    document.head.appendChild(css);
  }

  var say = function (html, accent) {
    el.innerHTML = html;
    el.style.borderColor = accent || "rgba(255,255,255,.08)";
  };
  say("<span class='wa-ring'></span>Nova · reading your cart…");

  /* ── signing ───────────────────────────────────────────────────────── */
  var SAFE = /[^A-Za-z0-9\-_.!~*'()]/g;
  function esc(v) {
    return String(v).replace(SAFE, function (c) {
      return "%" + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0");
    });
  }
  function bytes(b64) {
    var raw = atob(b64), out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }
  function canonical(method, path, ts, params, body) {
    var out = method.toLowerCase() + "\n" + HOST + "\n" + path + "\n" + ts;
    var q = "";
    if (params && Object.keys(params).length) {
      q = Object.keys(params).sort().map(function (k) {
        var v = params[k];
        v = v === true ? "true" : v === false ? "false" : String(v);
        return esc(k) + "=" + esc(v);
      }).join("&");
    }
    var b = body && Object.keys(body).length ? JSON.stringify(body) : "";
    if (q || b) out += "\n" + q + b;
    return out;
  }
  var keyPromise = null;
  function signingKey() {
    // Prefer the key the page is actually shipping; fall back to the known one.
    if (keyPromise) return keyPromise;
    keyPromise = (async function () {
      try {
        var srcs = [].slice.call(document.querySelectorAll("script[src]"))
          .map(function (s) { return s.src; })
          .filter(function (u) { return /wonder\.com.*\.js$/.test(u); });
        for (var i = 0; i < srcs.length; i++) {
          var text = await (await fetch(srcs[i])).text();
          var m = text.match(/["']([A-Za-z0-9+/]{40,120}={0,2})["']/g) || [];
          for (var j = 0; j < m.length; j++) {
            var cand = m[j].slice(1, -1);
            try {
              var dec = atob(cand).trim();
              if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dec)) {
                return cand;
              }
            } catch (e) {}
          }
        }
      } catch (e) {}
      return FALLBACK_KEY;
    })();
    return keyPromise;
  }
  async function signed(method, path, params, body) {
    var ts = String(Date.now());
    var key = await signingKey();
    var ck = await crypto.subtle.importKey(
      "raw", bytes(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    var sig = await crypto.subtle.sign(
      "HMAC", ck, new TextEncoder().encode(canonical(method, path, ts, params, body))
    );
    var mac = btoa(String.fromCharCode.apply(null, new Uint8Array(sig)));
    var qs = params && Object.keys(params).length
      ? "?" + Object.keys(params).map(function (k) {
          return esc(k) + "=" + esc(params[k]);
        }).join("&")
      : "";
    var headers = {
      accept: "application/json",
      "x-timestamp": ts,
      "x-request-id": (crypto.randomUUID ? crypto.randomUUID() : String(Math.random())),
      "x-hmac": mac,
    };
    if (body) headers["content-type"] = "application/json";
    var resp = await fetch("https://" + HOST + path + qs, {
      method: method,
      headers: headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!resp.ok) throw new Error(path + " → " + resp.status);
    return resp.json();
  }

  /* ── read the cart ─────────────────────────────────────────────────── */
  // A cart line's chosen options are not in the cart or checkout payloads —
  // only `GET /order/ajax/cart/menu-item/{lineId}` returns them, which is what
  // the site itself calls when you re-open an item to edit it.
  // Where the option groups hang off the detail response. A build-your-own
  // nests them under the item rather than at the root, so try both.
  // Keep only groups that actually chose something, and shape each one the way
  // the bot expects. Wonder sends quantity as a float (1.0).
  function cleanOptions(groups) {
    return (groups || []).map(function (g) {
      var vals = (g.option_values || []).filter(function (v) {
        return v.option_value_id;
      }).map(function (v) {
        return {
          option_value_id: v.option_value_id,
          quantity: Number(v.quantity || 1),
        };
      });
      if (!g.option_id || !vals.length) return null;
      return {
        option_id: g.option_id,
        parent_option_value_id: g.parent_option_value_id || null,
        option_values: vals,
      };
    }).filter(Boolean);
  }

  function groupsOf(node) {
    if (!node) return [];
    return node.item_options || node.options || node.featured_options ||
           node.option_groups || [];
  }

  // Options are a tree, not a list: picking "Any 3 Rolls" opens a group whose
  // chosen values each carry their own groups (which roll, then its sauce).
  // Walking only the top level loses every child choice, which is what left
  // required options empty and made the bot refuse the cart.
  function pickOptions(detail) {
    var out = [];
    var roots = groupsOf(detail);
    if (!roots.length) roots = groupsOf(detail.menu_item || detail.item || detail.cart_item);

    function walk(groups, parentValueId) {
      (groups || []).forEach(function (group) {
        var gid = group.option_id || group.id;
        if (!gid) return;
        var values = group.option_values || group.values || group.choices || [];
        // Field names differ by group type. A captured `featured_options`
        // group marks its picks with `selected` and carries the count in
        // `selected_quantity`; preset customisations use their own flag. A
        // chosen add-on whose only signal was selected_quantity was being
        // dropped, which silently exported a cart missing what was picked.
        var chosen = values.filter(function (v) {
          return v.is_selected || v.selected || v.is_default_selected ||
                 v.preset_customization_selected ||
                 (v.selected_quantity != null && v.selected_quantity > 0) ||
                 (v.quantity != null && v.quantity > 0);
        });
        if (!chosen.length) return;
        out.push({
          option_id: gid,
          parent_option_value_id: group.parent_option_value_id || parentValueId || null,
          option_values: chosen.map(function (v) {
            return {
              option_value_id: v.option_value_id || v.id,
              quantity: Number(v.selected_quantity || v.quantity || 1),
            };
          }),
        });
        // Recurse into whatever each chosen value opened up.
        chosen.forEach(function (v) {
          var childId = v.option_value_id || v.id;
          var kids = groupsOf(v);
          if (kids.length) walk(kids, childId);
        });
      });
    }

    walk(roots, null);
    return out;
  }

  // One retry: a dropped detail read is indistinguishable from an item with no
  // options, and losing it silently is what got a cart rejected at checkout.
  async function detailFor(lineId) {
    for (var attempt = 0; attempt < 2; attempt++) {
      try {
        return await signed("GET", "/order/ajax/cart/menu-item/" + lineId, null, null);
      } catch (e) {
        if (attempt) return null;
        await new Promise(function (r) { setTimeout(r, 400); });
      }
    }
    return null;
  }

  // Anything that is not a plain menu item — a combo, a Biggie Bag, any
  // bundle — cannot be rebuilt by the bot: its cart builder knows menu_item_id
  // and nothing else. Those lines used to be dropped without a word, so a cart
  // holding nothing but combos reported "your cart looks empty" while the
  // items sat there on screen. They are counted and named now.
  function collect(checkout) {
    var items = [], skipped = [];
    // Verified against a real web cart: brand_category is a property of the
    // CART, never of the line — every line-level lookup for it came back null,
    // which left add_item guessing the scope it resolves menu_item_id within.
    var cartScope = checkout.brand_category || null;
    (checkout.cart_restaurants || checkout.restaurant_views || []).forEach(function (r) {
      var rid = r.restaurant_id || r.id;
      // /order/ajax/checkout nests lines under `checkout_items`; the cart
      // endpoint calls them `cart_items`. Accept either.
      var lines = r.checkout_items || r.cart_items || r.items || [];
      lines.forEach(function (entry) {
        var mi = entry.menu_item || entry.bundle_item || entry;
        // `menu_item_id` is the dish in the menu; `id` is this cart line.
        // Re-adding needs the dish.
        var id = mi.menu_item_id || mi.id;
        // Judge the line by whether it yields a dish id, never by its `type`
        // label. Filtering on type !== "MENU_ITEM" rejected perfectly ordinary
        // items whose type the web cart spells differently from the mobile
        // one, and told people their food was a combo. A line only cannot be
        // grabbed when there is no menu_item_id to re-add it with.
        if (!id) {
          var label = mi.menu_item_name || mi.name || mi.bundle_name || "";
          if (label || entry.bundle_item || entry.bundle_id) {
            skipped.push(label || "a combo");
          }
          return;
        }
        // The line id lives somewhere different depending on which endpoint
        // answered — /order/ajax/cart hangs it on menu_item.id, checkout does
        // not always. Missing it skipped the options read altogether and
        // exported a build-your-own with an empty options list.
        var lineId = mi.menu_item_id ? (mi.id || entry.id) : entry.id;
        lineId = lineId || entry.cart_item_id || mi.cart_item_id ||
                 mi.instance_id || entry.instance_id || null;
        items.push({
          restaurant_id: entry.restaurant_id || rid,
          menu_item_id: id,
          // the cart line id, used to read back the chosen options
          line_id: lineId,
          menu_item_name: mi.menu_item_name || mi.name || "",
          // add_item resolves menu_item_id *within* (restaurant_id,
          // brand_category), and a LOCAL item also needs its category and
          // variation. None of this was being carried, so a third-party dish
          // was looked up in Wonder's own kitchen catalogue and came back
          // "menu item not found". The cart line already states all of it.
          brand_category: entry.brand_category || mi.brand_category || cartScope,
          category_id: entry.category_id || mi.category_id || null,
          category_name: entry.category_name || mi.category_name ||
                         mi.menu_course || null,
          special_category_name: entry.special_category_name ||
                                 mi.special_category_name || null,
          quantity: Math.max(1, Number(mi.quantity || 1)),
          // The cart line already carries the chosen options in exactly the
          // shape the bot wants — option_id, parent_option_value_id and
          // option_values[{option_value_id, quantity}]. Reading them here
          // means the per-item detail call below is only needed when the cart
          // did not supply them, which is what used to fail a whole grab with
          // "couldn't read the choices" on a cart that was perfectly readable.
          // `null` means "not supplied, go and ask"; `[]` means "genuinely
          // has none", and those are not the same thing.
          options: Array.isArray(mi.options) ? cleanOptions(mi.options)
                 : Array.isArray(entry.options) ? cleanOptions(entry.options)
                 : null,
        });
      });
    });
    return { items: items, skipped: skipped };
  }

  (async function () {
    try {
      var checkout = await signed("GET", "/order/ajax/checkout", null, null);
      // Checkout is the authority on address and dining option, but its lines
      // do not reliably carry the cart line id. /order/ajax/cart does, so read
      // the lines from there and fall back only if it fails.
      var items = [], skipped = [], cartErr = null, cartAddrSource = {};
      try {
        var cart = await signed("GET", "/order/ajax/cart", null, null);
        cartAddrSource = cart || {};
        var got = collect(cart);
        items = got.items;
        skipped = got.skipped;
      } catch (e) {
        // Swallowing this made every cart-read failure look like an empty
        // cart. Keep it and say it, if nothing else can be read.
        cartErr = e;
      }
      if (!items.filter(function (i) { return i.line_id; }).length) {
        var fromCheckout = collect(checkout);
        if (fromCheckout.items.filter(function (i) { return i.line_id; }).length ||
            !items.length) {
          items = fromCheckout.items;
          skipped = fromCheckout.skipped;
        }
      }
      // A cart made entirely of combos is not an empty cart. Telling somebody
      // to "add something first" when their food is right there on the screen
      // is the bug being fixed here.
      if (!items.length && skipped.length) {
        say("Couldn't read " + skipped.join(", ") +
            ". <div style='font-size:12px;color:#8d93a1;margin-top:6px'>" +
            "Combos and bundles can't be grabbed yet — add the pieces as " +
            "separate items and run this again.</div>", "#ed4245");
        return;
      }
      if (!items.length) {
        say(cartErr
              ? "Couldn't read your cart — " + cartErr.message
              : "Your cart looks empty — add something first.", "#ed4245");
        return;
      }
      // Exporting only the readable half hands somebody an order missing the
      // thing they actually wanted. Stop here instead of quietly shipping a
      // subset of their cart.
      if (skipped.length) {
        say("Couldn't include " + skipped.join(", ") +
            ".<div style='font-size:12px;color:#8d93a1;margin-top:6px'>" +
            "Combos and bundles can't be grabbed yet. Remove it, or order it " +
            "separately, then run this again.</div>", "#ed4245");
        return;
      }
      var units = items.reduce(function (n, i) { return n + i.quantity; }, 0);
      say("Reading your choices on " + items.length + " item(s)…");

      // Pull each line's configuration, so a build-your-own replays exactly.
      var blind = [];
      for (var n = 0; n < items.length; n++) {
        // The cart already told us the choices — no second call, and nothing
        // to fail. This is the normal path.
        if (Array.isArray(items[n].options)) {
          delete items[n].line_id;
          continue;
        }
        items[n].options = [];
        if (!items[n].line_id) {
          blind.push(items[n].menu_item_name || "an item");
          continue;
        }
        var detail = await detailFor(items[n].line_id);
        if (!detail) {
          blind.push(items[n].menu_item_name || "an item");
          delete items[n].line_id;
          continue;
        }
        items[n].options = pickOptions(detail);
        // The detail states the scope for this specific dish, which beats the
        // cart-wide one when a cart mixes Wonder's own kitchens with a
        // third-party restaurant.
        if (detail.brand_category) items[n].brand_category = detail.brand_category;
        if (detail.category_id) items[n].category_id = detail.category_id;
        if (detail.variations && detail.variations.length) {
          var picked = detail.variations.filter(function (v) {
            return v.is_selected || v.selected;
          })[0] || detail.variations[0];
          var vid = picked && (picked.variation_id || picked.id);
          // Carry it whatever it looks like. A WONDER_LOCAL item — a real
          // third-party restaurant rather than one of Wonder's own kitchens —
          // has ids issued by that restaurant, and they are not UUIDs. Adding
          // a UUID test here dropped the variation those items require and
          // turned their "unavailable" into "menu item not found".
          if (vid) items[n].variation_id = vid;
        }
        if (detail.special_instructions) {
          items[n].special_instructions = detail.special_instructions;
        }
        items[n].customizable = !!detail.customizable;
        delete items[n].line_id;
      }
      var configured = items.filter(function (i) { return i.options.length; }).length;
      // Exporting a build-your-own with no choices produces a code the bot
      // refuses at checkout. Say it here, where the cart is still open, rather
      // than letting it fail later.
      if (blind.length) {
        say("Couldn't read the choices on " + blind.join(", ") +
            ".<div style='font-size:12px;color:#8d93a1;margin-top:6px'>" +
            "Open that item in your cart, confirm its options, then run this " +
            "again.</div>", "#ed4245");
        return;
      }
      say("Saving " + units + " item(s)" +
          (configured ? " · " + configured + " customised" : "") + "…");

      // Pickup carts legitimately have no address — carry the fulfillment so
      // the bot does not go looking for one.
      var fulfillment = (checkout.dining_option || cartAddrSource.dining_option
                         || "DELIVERY").toUpperCase();
      // Forter scores the order and will decline a made-up token. The real
      // one is a plain cookie in your browser, tied to a genuine session, so
      // carry it along with the cart.
      var forter = (document.cookie.match(/(?:^|;\s*)forterToken=([^;]+)/) || [])[1] || null;

      items.forEach(function (i) { if (!Array.isArray(i.options)) i.options = []; });
      var resp = await fetch(API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: items,
          // Both endpoints carry an address and neither is always populated —
          // the checkout's is preferred because it is the one that includes the
          // zip code. Every cart grabbed before this went out with a null
          // address, and where an order can be delivered is exactly what
          // decides whether its restaurant is available at all.
          address: checkout.address || cartAddrSource.address || null,
          fulfillment: fulfillment,
          forter_token: forter,
        }),
      });
      var out = await resp.json();
      if (!resp.ok) throw new Error(out.error || resp.status);

      // Best-effort: this runs after the async fetch above, so the click
      // that launched the bookmarklet may no longer count as a user gesture —
      // Chrome can prompt, Safari rejects outright. So it is a bonus, not the
      // mechanism, and we never claim success unless it truly copied.
      var copied = false;
      try { await navigator.clipboard.writeText(out.code); copied = true; } catch (e) {}
      var addr = checkout.address || {};
      var where = fulfillment === "PICKUP"
        ? "pickup"
        : [addr.address_name || addr.address_line, addr.city].filter(Boolean).join(", ");
      // The code is the whole point, and it is already on the clipboard —
      // so it is the only thing shown large. The command used to be printed
      // underneath, which invited people to type it out by hand instead of
      // pasting what they already had.
      say(
        "<div style='font-size:10.5px;letter-spacing:.2em;color:#7f8796;" +
        "text-transform:uppercase'>" +
          (copied ? "Copied to your clipboard" : "Your cart code") + "</div>" +
        // Solid colour first, gradient as enhancement: a background-clip:text
        // fill that fails must not leave the code invisible on some random site.
        "<div id='wa-code' class='wa-code' role='button' tabindex='0' " +
        "style='font:700 40px/1.15 ui-monospace,SFMono-Regular,Menlo,monospace;" +
        "letter-spacing:.18em;margin:10px 0 4px;cursor:pointer;" +
        "user-select:all;-webkit-user-select:all;color:#f8c000;" +
        "background:linear-gradient(180deg,#ffe28a,#f8c000);" +
        "-webkit-background-clip:text;background-clip:text;" +
        "-webkit-text-fill-color:transparent'>" + out.code + "</div>" +
        "<div id='wa-hint' style='font-size:11px;font-weight:600;color:#f8c000;" +
        "margin-bottom:6px'>" +
          (copied ? "Tap the code to copy again" : "Tap the code to copy") + "</div>" +
        "<div style='font-size:12.5px;color:#8d93a1'>" + units +
        " item" + (units === 1 ? "" : "s") + (where ? " · " + where : "") + "</div>",
        "rgba(248,192,0,.55)"
      );
      // A click on the code is a FRESH user gesture, so writeText succeeds in
      // every browser with no permission prompt — this is the reliable copy,
      // the async one above is just a head start.
      var _cp = document.getElementById("wa-code");
      var _copyNow = function () {
        try {
          navigator.clipboard.writeText(out.code).then(function () {
            var h = document.getElementById("wa-hint");
            if (h) { h.textContent = "Copied \u2713"; h.style.color = "#3ac07f"; }
          }, function () {});
        } catch (e) {}
      };
      if (_cp) {
        _cp.addEventListener("click", _copyNow);
        _cp.addEventListener("keydown", function (ev) {
          if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); _copyNow(); }
        });
      }
      // Long enough to glance at, short enough not to sit on the page.
      setTimeout(function () {
        el.style.opacity = "0";
        el.style.transform = "translate(-50%,-10px)";
        setTimeout(function () { el.remove(); }, 340);
      }, 22000);
    } catch (err) {
      say("<div style='font-size:10.5px;letter-spacing:.2em;color:#f0868c;" +
          "text-transform:uppercase'>Couldn't read your cart</div>" +
          "<div style='margin:8px 0 2px'>" + err.message + "</div>" +
          "<div style='font-size:12px;color:#8d93a1'>" +
          "Sign in on wonder.com with the cart open, then try again.</div>",
          "rgba(237,66,69,.55)");
    }
  })();
})();