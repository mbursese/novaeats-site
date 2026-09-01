(function () {
  const META_KEY = "__wonder_cart_meta";
  const LINE_META_KEY = "__wonder_cart_line_meta";
  const EVENT_LOG_KEY = "__wonder_cart_event_log";
  const CART_PATH_PREFIXES = ["/order/ajax/v2/cart/", "/order/ajax/v3/cart/", "/v2/cart/", "/v3/cart/"];

  if (window.__wonderInterceptPatched) return;
  window.__wonderInterceptPatched = true;

  function readMeta() {
    try {
      return JSON.parse(sessionStorage.getItem(META_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function writeMeta(meta) {
    sessionStorage.setItem(META_KEY, JSON.stringify(meta));
  }

  function readLineMeta() {
    try {
      return JSON.parse(sessionStorage.getItem(LINE_META_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function writeLineMeta(meta) {
    sessionStorage.setItem(LINE_META_KEY, JSON.stringify(meta));
  }

  function recordRawEvent(event) {
    try {
      const current = JSON.parse(sessionStorage.getItem(EVENT_LOG_KEY) || "[]");
      const list = Array.isArray(current) ? current : [];
      list.push({
        ts: Date.now(),
        method: event.method || "",
        url: event.url || "",
        request: typeof event.request === "string" ? event.request.slice(0, 12000) : "",
        response: typeof event.response === "string" ? event.response.slice(0, 40000) : "",
      });
      sessionStorage.setItem(EVENT_LOG_KEY, JSON.stringify(list.slice(-50)));
    } catch {}
  }

  function rawBodyText(body) {
    if (typeof body === "string") return body;
    if (body == null) return "";
    try {
      return JSON.stringify(body);
    } catch {
      return String(body);
    }
  }

  function cartLineId(row, item) {
    const keys = [
      "cart_item_id", "cartItemId", "cart_item_uuid", "cartItemUuid",
      "checkout_item_id", "checkoutItemId", "line_item_id", "lineItemId",
      "item_uuid", "itemUuid", "uuid", "id",
    ];
    for (const source of [row, item]) {
      if (!source || typeof source !== "object") continue;
      for (const key of keys) {
        const value = source[key];
        if (value != null && typeof value !== "object") return String(value);
      }
    }
    return "";
  }

  function moneyAmount(value) {
    if (value == null || value === "") return null;
    if (typeof value === "number") {
      const amount = Math.abs(value) >= 100 ? value / 100 : value;
      return Math.round(amount * 100) / 100;
    }
    const text = String(value).replace(/[$,]/g, "").trim();
    if (!text) return null;
    const parsed = Number(text);
    return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : null;
  }

  function subtotalFromSources(...sources) {
    const keys = [
      "expected_subtotal", "formatted_subtotal", "subtotal", "line_subtotal",
      "formatted_line_subtotal", "item_subtotal", "formatted_item_subtotal",
      "total_price", "formatted_total_price", "price_of_total_quantity",
      "priceOfTotalQuantity", "subtotal_cents", "total_cents",
    ];
    for (const source of sources) {
      if (!source || typeof source !== "object") continue;
      for (const key of keys) {
        const amount = moneyAmount(source[key]);
        if (amount != null) return amount;
      }
    }
    return null;
  }

  function bodyToObject(body) {
    if (!body) return;
    if (typeof body === "string") {
      try {
        return JSON.parse(body);
      } catch {
        try {
          return Object.fromEntries(new URLSearchParams(body));
        } catch {
          return null;
        }
      }
    }
    if (body instanceof URLSearchParams) return Object.fromEntries(body);
    if (body instanceof FormData) {
      const out = {};
      for (const [key, value] of body.entries()) {
        if (typeof value === "string") {
          const trimmed = value.trim();
          if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
            try {
              out[key] = JSON.parse(trimmed);
              continue;
            } catch {}
          }
        }
        out[key] = value;
      }
      return out;
    }
    if (typeof body === "object") return body;
    return null;
  }

  function deepFind(obj, keys) {
    const wanted = new Set(keys);
    const seen = new Set();
    function walk(value) {
      if (!value || typeof value !== "object" || seen.has(value)) return "";
      seen.add(value);
      for (const key of Object.keys(value)) {
        if (wanted.has(key) && value[key] != null && typeof value[key] !== "object") return String(value[key]);
      }
      for (const key of Object.keys(value)) {
        const found = walk(value[key]);
        if (found) return found;
      }
      return "";
    }
    return walk(obj);
  }

  function deepOptions(obj) {
    if (!obj || typeof obj !== "object") return [];
    if (Array.isArray(obj.options)) return obj.options;
    if (Array.isArray(obj.selected_options)) return obj.selected_options;
    if (Array.isArray(obj.modifiers)) return obj.modifiers;
    for (const value of Object.values(obj)) {
      if (value && typeof value === "object") {
        const found = deepOptions(value);
        if (found.length) return found;
      }
    }
    return [];
  }

  function cloneValue(value) {
    if (value == null) return value;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return value;
    }
  }

  function hasStructuredValue(value) {
    if (value == null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    if (typeof value === "string") return value.trim().length > 0;
    return true;
  }

  function pickStructuredValue(sources, keys) {
    const seen = new Set();
    function walk(value) {
      if (!value || typeof value !== "object" || seen.has(value)) return null;
      seen.add(value);
      for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(value, key) && hasStructuredValue(value[key])) {
          return cloneValue(value[key]);
        }
      }
      for (const child of Object.values(value)) {
        const found = walk(child);
        if (hasStructuredValue(found)) return found;
      }
      return null;
    }
    for (const source of sources || []) {
      const found = walk(source);
      if (hasStructuredValue(found)) return found;
    }
    return null;
  }

  function comboSelections(...sources) {
    const out = {};
    const paired = pickStructuredValue(sources.filter(Boolean), [
      "paired_menu_items", "pairedMenuItems", "paired_items", "pairedItems",
      "combo_items", "comboItems", "selected_combo_items", "selectedComboItems",
      "selected_items", "selectedItems", "bundle_items", "bundleItems",
      "selected_bundle_items", "selectedBundleItems",
      "components", "selected_components", "selectedComponents",
      "component_items", "componentItems", "selected_component_items", "selectedComponentItems",
      "included_items", "includedItems", "children", "child_items", "childItems",
      "combo_selections", "comboSelections",
    ]);
    const bundleOptions = pickStructuredValue(sources.filter(Boolean), [
      "bundle_item_selected_option_values", "bundleItemSelectedOptionValues",
      "selected_bundle_option_values", "selectedBundleOptionValues",
      "bundle_selected_option_values", "bundleSelectedOptionValues",
      "selected_option_values", "selectedOptionValues",
      "component_selected_option_values", "componentSelectedOptionValues",
      "selected_component_option_values", "selectedComponentOptionValues",
      "bundle_choice_option_values", "bundleChoiceOptionValues",
    ]);
    const choices = pickStructuredValue(sources.filter(Boolean), [
      "choices", "Choices", "selected_choices", "selectedChoices",
      "choice_values", "choiceValues", "selected_choice_values", "selectedChoiceValues",
      "choice_selections", "choiceSelections", "selected_choice_menu_items", "selectedChoiceMenuItems",
      "choice_groups", "choiceGroups", "selected_choice_groups", "selectedChoiceGroups",
      "bundle_choice_groups", "bundleChoiceGroups",
      "bundle_choices", "bundleChoices", "bundle_choice_values", "bundleChoiceValues",
      "component_choices", "componentChoices", "selected_component_choices", "selectedComponentChoices",
    ]);
    if (hasStructuredValue(paired)) out.paired_menu_items = paired;
    if (hasStructuredValue(bundleOptions)) out.bundle_item_selected_option_values = bundleOptions;
    if (hasStructuredValue(choices)) out.choices = choices;
    return out;
  }

  function mergeMetaItem(id, update) {
    if (!id || !update || typeof update !== "object") return;
    const meta = readMeta();
    const prev = meta[id] || {};
    meta[id] = {
      type: update.type || prev.type || "",
      bundle_item_id: update.bundle_item_id || prev.bundle_item_id || "",
      bundle_item_name: update.bundle_item_name || prev.bundle_item_name || "",
      category_id: update.category_id || prev.category_id || "",
      category_name: update.category_name || prev.category_name || "",
      menu_item_name: update.menu_item_name || prev.menu_item_name || "",
      options: Array.isArray(update.options) && update.options.length ? update.options : (prev.options || []),
      variation_id: update.variation_id || prev.variation_id || "",
      paired_menu_items: hasStructuredValue(update.paired_menu_items) ? update.paired_menu_items : prev.paired_menu_items,
      bundle_item_selected_option_values: hasStructuredValue(update.bundle_item_selected_option_values) ? update.bundle_item_selected_option_values : prev.bundle_item_selected_option_values,
      choices: hasStructuredValue(update.choices) ? update.choices : prev.choices,
    };
    writeMeta(meta);
  }

  function mergeLineMeta(id, update) {
    if (!id || !update || typeof update !== "object") return;
    const meta = readLineMeta();
    const prev = meta[id] || {};
    meta[id] = {
      options: Array.isArray(update.options) && update.options.length ? update.options : (prev.options || []),
      paired_menu_items: hasStructuredValue(update.paired_menu_items) ? update.paired_menu_items : prev.paired_menu_items,
      bundle_item_selected_option_values: hasStructuredValue(update.bundle_item_selected_option_values) ? update.bundle_item_selected_option_values : prev.bundle_item_selected_option_values,
      choices: hasStructuredValue(update.choices) ? update.choices : prev.choices,
      special_instructions: update.special_instructions || prev.special_instructions || "",
      expected_subtotal: update.expected_subtotal != null ? update.expected_subtotal : prev.expected_subtotal,
    };
    writeLineMeta(meta);
  }

  function recordCartItem(item, fallback) {
    if (!item || typeof item !== "object") return;
    const menuItem = item.menu_item || item.bundle_item || item.item || item.added_item || {};
    const rawType = String(item.type || item.item_type || item.itemType || "").toUpperCase();
    const isBundle = rawType === "BUNDLE_ITEM" || !!item.bundle_item || !!item.bundle_item_id || !!menuItem.bundle_item_id || !!menuItem.bundle_item_name;
    const id =
      item.item_id ||
      item.menu_item_id ||
      item.bundle_item_id ||
      menuItem.menu_item_id ||
      menuItem.bundle_item_id ||
      menuItem.item_id ||
      menuItem.id ||
      fallback;
    if (!id) return;
    const selections = comboSelections(item, menuItem);
    const update = {
      type: isBundle ? "BUNDLE_ITEM" : "MENU_ITEM",
      bundle_item_id: isBundle ? (item.bundle_item_id || menuItem.bundle_item_id || id) : "",
      bundle_item_name: isBundle ? (item.bundle_item_name || item.name || menuItem.bundle_item_name || menuItem.name || "") : "",
      category_id: item.category_id || menuItem.category_id || "",
      category_name: item.category_name || menuItem.category_name || "",
      menu_item_name: item.menu_item_name || item.name || menuItem.menu_item_name || menuItem.item_name || menuItem.name || "",
      options: item.options || menuItem.options || deepOptions(item),
      special_instructions: item.special_instructions || item.specialInstructions || menuItem.special_instructions || menuItem.specialInstructions || "",
      expected_subtotal: subtotalFromSources(item, menuItem),
      variation_id:
        item.variation_id ||
        item.variationId ||
        item.menu_item_variation_id ||
        item.menuItemVariationId ||
        item.selected_variation_id ||
        item.selectedVariationId ||
        item.selected_menu_item_variation_id ||
        item.selectedMenuItemVariationId ||
        menuItem.variation_id ||
        menuItem.variationId ||
        menuItem.menu_item_variation_id ||
        menuItem.menuItemVariationId ||
        menuItem.selected_variation_id ||
        menuItem.selectedVariationId ||
        menuItem.selected_menu_item_variation_id ||
        menuItem.selectedMenuItemVariationId ||
        deepFind(item, ["variation_id", "variationId", "menu_item_variation_id", "menuItemVariationId", "selected_variation_id", "selectedVariationId", "selected_menu_item_variation_id", "selectedMenuItemVariationId", "quick_add_variation_id", "quickAddVariationId"]) ||
        deepFind(menuItem, ["variation_id", "variationId", "menu_item_variation_id", "menuItemVariationId", "selected_variation_id", "selectedVariationId", "selected_menu_item_variation_id", "selectedMenuItemVariationId", "quick_add_variation_id", "quickAddVariationId"]) ||
        "",
      ...selections,
    };
    mergeMetaItem(id, update);
    mergeLineMeta(cartLineId(item, menuItem), update);
  }

  function recordCartResponse(body) {
    const parsed = bodyToObject(body);
    if (!parsed || typeof parsed !== "object") return;
    try {
      const summary = parsed.cart_summary || {};
      for (const view of [...(summary.restaurant_views || []), ...(summary.cart_restaurants || [])]) {
        for (const item of [...(view.items || []), ...(view.checkout_items || []), ...(view.cart_items || [])]) recordCartItem(item);
      }
      for (const view of [...(parsed.restaurant_views || []), ...(parsed.cart_restaurants || [])]) {
        for (const item of [...(view.cart_items || []), ...(view.checkout_items || []), ...(view.items || [])]) recordCartItem(item);
      }
      if (parsed.added_cart_view && parsed.added_cart_view.added_item) {
        recordCartItem(parsed.added_cart_view.added_item);
      }
      if (parsed.updated_cart_view && parsed.updated_cart_view.updated_item) {
        recordCartItem(parsed.updated_cart_view.updated_item);
      }
    } catch (e) {
      console.warn("[cart-grabber:wonder] failed to record cart response metadata", e);
    }
  }

  function recordBody(body) {
    const parsed = bodyToObject(body);
    if (!parsed) return;
    try {
      const item = parsed.menu_item || parsed.bundle_item || parsed.item || {};
      const category = parsed.category || parsed.menu_category || {};
      const variation = parsed.variation || parsed.menu_item_variation || parsed.selected_variation || {};
      const isBundle = !!parsed.bundle_item_id || !!item.bundle_item_id || String(parsed.type || "").toUpperCase() === "BUNDLE_ITEM";
      const id = parsed.menu_item_id || parsed.bundle_item_id || parsed.item_id || item.menu_item_id || item.bundle_item_id || item.item_id || item.id || deepFind(parsed, ["menu_item_id", "bundle_item_id", "item_id"]);
      if (!id) return;
      const selections = comboSelections(parsed, item);
      const update = {
        type: isBundle ? "BUNDLE_ITEM" : "MENU_ITEM",
        bundle_item_id: isBundle ? (parsed.bundle_item_id || item.bundle_item_id || id) : "",
        bundle_item_name: isBundle ? (parsed.bundle_item_name || parsed.name || item.bundle_item_name || item.name || "") : "",
        category_id: parsed.category_id || parsed.category_run_id || category.id || category.category_id || category.category_run_id || item.category_id || item.category_run_id || deepFind(parsed, ["category_id", "category_run_id"]) || "",
        category_name: parsed.category_name || category.name || category.category_name || item.category_name || deepFind(parsed, ["category_name", "name"]) || "",
        menu_item_name: parsed.menu_item_name || parsed.bundle_item_name || parsed.name || item.menu_item_name || item.bundle_item_name || item.item_name || item.name || deepFind(parsed, ["menu_item_name", "bundle_item_name", "item_name", "name"]) || "",
        options: parsed.options || item.options || deepOptions(parsed),
        special_instructions: parsed.special_instructions || parsed.specialInstructions || item.special_instructions || item.specialInstructions || "",
        expected_subtotal: subtotalFromSources(parsed, item),
        variation_id: parsed.variation_id || parsed.variationId || parsed.menu_item_variation_id || parsed.menuItemVariationId || parsed.selected_variation_id || parsed.selectedVariationId || parsed.selected_menu_item_variation_id || parsed.selectedMenuItemVariationId || variation.id || variation.variation_id || variation.variationId || variation.menu_item_variation_id || variation.menuItemVariationId || item.variation_id || item.variationId || item.menu_item_variation_id || item.menuItemVariationId || item.selected_variation_id || item.selectedVariationId || item.selected_menu_item_variation_id || item.selectedMenuItemVariationId || item.quick_add_variation_id || item.quickAddVariationId || deepFind(parsed, ["variation_id", "variationId", "menu_item_variation_id", "menuItemVariationId", "selected_variation_id", "selectedVariationId", "selected_menu_item_variation_id", "selectedMenuItemVariationId", "quick_add_variation_id", "quickAddVariationId"]) || "",
        ...selections,
      };
      mergeMetaItem(id, update);
      mergeLineMeta(cartLineId(parsed, item), update);
    } catch (e) {
      console.warn("[cart-grabber:wonder] failed to record cart metadata", e);
    }
  }

  function shouldRecord(method, url) {
    const normalizedMethod = String(method || "GET").toUpperCase();
    const normalizedUrl = String(url || "");
    return normalizedMethod === "POST" && CART_PATH_PREFIXES.some((prefix) => normalizedUrl.includes(prefix));
  }

  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const input = args[0];
    const init = args[1];
    const url = typeof input === "string" ? input : (input && input.url) || "";
    const method = (init && init.method) || (input && input.method) || "GET";
    const record = shouldRecord(method, url);
    if (record) {
      let body = null;
      if (init && init.body) body = init.body;
      else if (input instanceof Request) body = await input.clone().text().catch(() => null);
      recordRawEvent({ method, url, request: rawBodyText(body) });
      recordBody(body);
    }
    const response = await originalFetch.apply(this, args);
    if (record) {
      response.clone().text().then((text) => {
        recordRawEvent({ method, url, response: text });
        recordCartResponse(text);
      }).catch(() => {});
    }
    return response;
  };

  const XHR = window.XMLHttpRequest;
  const originalOpen = XHR.prototype.open;
  const originalSend = XHR.prototype.send;
  XHR.prototype.open = function (method, url, ...rest) {
    this.__wonderMethod = method;
    this.__wonderUrl = url;
    return originalOpen.call(this, method, url, ...rest);
  };
  XHR.prototype.send = function (body) {
    if (shouldRecord(this.__wonderMethod, this.__wonderUrl)) {
      recordRawEvent({ method: this.__wonderMethod, url: this.__wonderUrl, request: rawBodyText(body) });
      recordBody(body);
      this.addEventListener("loadend", function () {
        try {
          if (typeof this.responseText === "string") {
            recordRawEvent({ method: this.__wonderMethod, url: this.__wonderUrl, response: this.responseText });
            recordCartResponse(this.responseText);
          }
        } catch {}
      });
    }
    return originalSend.call(this, body);
  };
})();
