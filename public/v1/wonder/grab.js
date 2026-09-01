window.__novaGrabber = {
  provider: "wonder",
  src: "https://cart.wonderfulbot.org/static/grab.js",
};
/* Nova cart grabber — branded wrapper around the cart server's grab.js. */
(function () {
  if (window.__novaGrabBusy) return;
  window.__novaGrabBusy = true;

  var BOUND = window.__novaGrabber || {};
  var PROVIDER = BOUND.provider === "yonder" ? "yonder" : "wonder";
  var GRAB_SRC =
    BOUND.src ||
    "https://cart.wonderfulbot.org/static/grab.js";
  var GOLD = "#f8c000";
  var UPSTREAM_PANEL_ID = "wonder-cart-grabber-panel";
  var UPSTREAM_STYLE_ID = "nova-grabber-upstream-quarantine";
  var capturedCart = null;

  function hideUpstreamPanel(node) {
    if (!node) return;
    node.style.display = "none";
    node.style.visibility = "hidden";
    node.style.pointerEvents = "none";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function money(value) {
    var n = Number(value);
    if (!isFinite(n) || n <= 0) return "";
    return "$" + n.toFixed(2);
  }

  function itemName(item) {
    if (!item || typeof item !== "object") return "";
    return String(
      item.name ||
        item.bundle_item_name ||
        item.bundleItemName ||
        item.menu_item_name ||
        item.menuItemName ||
        item.item_name ||
        item.itemName ||
        ""
    ).replace(/\s+/g, " ").trim();
  }

  function itemQty(item) {
    var n = Number(item && (item.quantity || item.qty || item.count || item.selected_quantity));
    return isFinite(n) && n > 0 ? Math.floor(n) : 1;
  }

  function uniqueLines(lines) {
    var seen = {};
    var out = [];
    for (var i = 0; i < lines.length; i++) {
      var line = String(lines[i] || "").replace(/\s+/g, " ").trim();
      if (!line || line.length > 72) continue;
      var key = line.toLowerCase();
      if (seen[key]) continue;
      seen[key] = true;
      out.push(line);
    }
    return out;
  }

  function optionLines(item) {
    if (!item || typeof item !== "object") return [];
    var lines = [];
    function pushName(value) {
      if (value == null) return;
      if (typeof value === "string" || typeof value === "number") {
        lines.push(value);
        return;
      }
      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) pushName(value[i]);
        return;
      }
      if (typeof value === "object") {
        pushName(
          value.name ||
            value.option_name ||
            value.option_value_name ||
            value.choice_name ||
            value.item_name ||
            value.menu_item_name ||
            value.display_name ||
            value.title
        );
        if (value.values) pushName(value.values);
        if (value.options) pushName(value.options);
        if (value.selected) pushName(value.selected);
      }
    }
    pushName(item.visible_components);
    pushName(item.selected_components);
    pushName(item.options);
    pushName(item.choices);
    pushName(item.selected_choices);
    pushName(item.paired_menu_items);
    var name = itemName(item).toLowerCase();
    return uniqueLines(lines)
      .filter(function (line) {
        return line.toLowerCase() !== name;
      })
      .slice(0, 4);
  }

  function looksLikeCart(cart) {
    return !!(cart && Array.isArray(cart.items) && cart.items.length);
  }

  function captureCart(payload) {
    if (!payload || typeof payload !== "object") return;
    var cart = looksLikeCart(payload.cart) ? payload.cart : payload;
    if (!looksLikeCart(cart)) return;
    if (!capturedCart || (cart.items && cart.items.length >= (capturedCart.items || []).length)) {
      capturedCart = cart;
    }
  }

  function itemsFromCheckout(data) {
    if (!data || typeof data !== "object") return;
    var views = (data.cart_restaurants || []).concat(data.restaurant_views || []);
    if (!views.length) return;
    var view = views[0];
    var rows = (view.checkout_items || []).concat(view.cart_items || [], view.items || []);
    var items = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var mi = (row && (row.menu_item || row.bundle_item || row.item)) || {};
      var name = itemName(row) || itemName(mi);
      if (!name) continue;
      items.push({
        name: name,
        quantity: itemQty(row) || itemQty(mi),
        expected_subtotal: row.expected_subtotal || mi.expected_subtotal,
        options: row.options || mi.options,
        choices: row.choices || mi.choices,
        visible_components: row.visible_components || mi.visible_components,
      });
    }
    if (!items.length) return;
    captureCart({
      store_name:
        (view.restaurant_name_view &&
          (view.restaurant_name_view.name || view.restaurant_name_view.nickname)) ||
        "",
      expected_subtotal: data.expected_subtotal || view.expected_subtotal,
      items: items,
    });
  }

  function hookNetwork() {
    if (window.__novaGrabFetchHooked) return;
    window.__novaGrabFetchHooked = true;
    var original = window.fetch;
    window.fetch = function () {
      var input = arguments[0];
      var init = arguments[1] || {};
      var url = typeof input === "string" ? input : (input && input.url) || "";
      var method = ((init && init.method) || (input && input.method) || "GET").toUpperCase();
      var body = init.body || (input && input.body);
      if (method === "POST" && body) {
        try {
          var parsed = typeof body === "string" ? JSON.parse(body) : body;
          if (/\/api\/v1\/cart/.test(url) || looksLikeCart(parsed) || looksLikeCart(parsed && parsed.cart)) {
            captureCart(parsed);
          }
        } catch (e) {}
      }
      return original.apply(this, arguments).then(function (response) {
        if (/\/order\/ajax\/checkout/.test(url) && response && response.clone) {
          response
            .clone()
            .json()
            .then(itemsFromCheckout)
            .catch(function () {});
        }
        return response;
      });
    };
  }

  var quarantineStyle = document.getElementById(UPSTREAM_STYLE_ID);
  if (!quarantineStyle) {
    quarantineStyle = document.createElement("style");
    quarantineStyle.id = UPSTREAM_STYLE_ID;
    quarantineStyle.textContent =
      "#" + UPSTREAM_PANEL_ID + ",#wa-grab{display:none!important;visibility:hidden!important;pointer-events:none!important;}";
    document.head.appendChild(quarantineStyle);
  }
  hideUpstreamPanel(document.getElementById(UPSTREAM_PANEL_ID));
  hideUpstreamPanel(document.getElementById("wa-grab"));
  hookNetwork();

  var host = document.createElement("div");
  host.setAttribute("data-nova-grabber", "1");
  host.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;background:rgba(6,6,10,.42);" +
    "display:flex;align-items:flex-end;justify-content:center;padding:12px 12px 18px;" +
    "font:15px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

  var card = document.createElement("div");
  card.style.cssText =
    "width:min(392px,100%);background:#101018;color:#f3f3f6;border-radius:22px;" +
    "border:1px solid rgba(248,192,0,.22);box-shadow:0 24px 60px rgba(0,0,0,.5);" +
    "padding:8px 18px 18px;text-align:left";
  host.appendChild(card);

  var style = document.createElement("style");
  style.textContent =
    "@keyframes novaSpin{to{transform:rotate(360deg)}}" +
    "@keyframes novaRise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}" +
    ".nova-in{animation:novaRise .2s ease-out}" +
    ".nova-handle{width:36px;height:4px;border-radius:99px;background:rgba(255,255,255,.16);margin:4px auto 12px}" +
    ".nova-kicker{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:" + GOLD + ";font-weight:700}" +
    ".nova-close{position:absolute;top:10px;right:8px;width:36px;height:36px;border:0;background:transparent;color:#8b8f99;font:500 24px/1 system-ui;cursor:pointer}" +
    ".nova-code{font:700 28px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.16em;" +
    "color:" + GOLD + ";margin:12px 0 2px;user-select:all;-webkit-user-select:all}" +
    ".nova-store{font-size:13px;color:#9aa0aa;margin-top:2px}" +
    ".nova-items{margin:12px 0 0;max-height:220px;overflow:auto;border-top:1px solid rgba(255,255,255,.08);padding:8px 0 2px}" +
    ".nova-row{display:grid;grid-template-columns:28px 1fr auto;gap:8px;padding:8px 0;align-items:start}" +
    ".nova-qty{width:24px;height:24px;border-radius:8px;background:rgba(248,192,0,.12);color:" + GOLD + ";" +
    "font:700 12px/24px ui-monospace,SFMono-Regular,Menlo,monospace;text-align:center}" +
    ".nova-name{color:#ececf1;font-size:14px;font-weight:600}" +
    ".nova-opt{margin-top:3px;font-size:12px;color:#8b8f99;line-height:1.35}" +
    ".nova-price{color:#8b8f99;font-variant-numeric:tabular-nums;font-size:13px;padding-top:3px}" +
    ".nova-total{display:flex;justify-content:space-between;align-items:center;margin-top:4px;" +
    "padding-top:10px;border-top:1px solid rgba(255,255,255,.08);font-size:13px;color:#9aa0aa}" +
    ".nova-total b{color:#f3f3f6;font-size:14px}" +
    ".nova-btn{width:100%;margin-top:14px;padding:13px;border:0;border-radius:14px;background:" + GOLD + ";" +
    "color:#07070d;font-size:15px;font-weight:700;cursor:pointer}" +
    ".nova-hint{margin-top:10px;font-size:12px;color:#8b8f99;line-height:1.45}" +
    ".nova-loader{width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.12);" +
    "border-top-color:" + GOLD + ";animation:novaSpin .8s linear infinite;margin:6px 0 12px}" +
    ".nova-err{font-size:15px;line-height:1.5;color:#f4f4f7}";
  document.head.appendChild(style);

  function render(html) {
    card.style.position = "relative";
    card.innerHTML = '<div class="nova-handle"></div>' + html;
    card.className = "nova-in";
    var x = card.querySelector("#nova-close");
    if (x) x.onclick = close;
  }

  function close() {
    stop();
    if (host.parentNode) host.parentNode.removeChild(host);
    window.__novaGrabBusy = false;
  }

  host.addEventListener("click", function (event) {
    if (event.target === host) close();
  });
  card.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  function loading() {
    render(
      '<button class="nova-close" id="nova-close" type="button" aria-label="Close">×</button>' +
        '<div class="nova-kicker">Nova</div>' +
        '<div class="nova-loader"></div>' +
        '<div style="font-size:16px;font-weight:600">Reading your cart</div>' +
        '<div class="nova-hint">Keep this tab open.</div>'
    );
  }

  var settled = false;
  var loaded = false;
  var poll = null;
  var observer = null;

  function stop() {
    settled = true;
    if (poll) clearInterval(poll);
    if (observer) observer.disconnect();
  }

  function cartTotal(cart) {
    if (!cart) return "";
    var direct = money(cart.expected_subtotal);
    if (direct) return direct;
    var items = cart.items || [];
    var sum = 0;
    var any = false;
    for (var i = 0; i < items.length; i++) {
      var n = Number(items[i] && items[i].expected_subtotal);
      if (isFinite(n) && n > 0) {
        sum += n;
        any = true;
      }
    }
    return any ? money(sum) : "";
  }

  function itemListHtml(cart) {
    var items = (cart && cart.items) || [];
    if (!items.length) return "";
    var rows = [];
    var count = 0;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var name = itemName(item);
      if (!name) continue;
      count += itemQty(item);
      var opts = optionLines(item);
      var price = money(item.expected_subtotal);
      rows.push(
        '<div class="nova-row">' +
          '<div class="nova-qty">' + itemQty(item) + "</div>" +
          "<div>" +
          '<div class="nova-name">' + escapeHtml(name) + "</div>" +
          (opts.length ? '<div class="nova-opt">' + escapeHtml(opts.join(" · ")) + "</div>" : "") +
          "</div>" +
          (price ? '<div class="nova-price">' + price + "</div>" : "<div></div>") +
          "</div>"
      );
    }
    if (!rows.length) return "";
    var total = cartTotal(cart);
    return (
      '<div class="nova-items">' +
      rows.join("") +
      "</div>" +
      (total
        ? '<div class="nova-total"><span>' +
          count +
          (count === 1 ? " item" : " items") +
          "</span><b>" +
          total +
          "</b></div>"
        : "")
    );
  }

  function copyCode(code, button) {
    var done = function () {
      button.textContent = "Copied";
    };
    var failed = function () {
      button.textContent = "Copy failed — select the code";
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done, failed);
    } else {
      var area = document.createElement("textarea");
      area.value = code;
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
        done();
      } catch (e) {
        failed();
      }
      document.body.removeChild(area);
    }
  }

  function success(code, detail) {
    stop();
    var cart = capturedCart || {};
    var store = cart.store_name || "";
    var count = ((cart.items || []).reduce(function (sum, item) {
      return sum + (itemName(item) ? itemQty(item) : 0);
    }, 0) || (cart.items || []).length);
    var subtitle = store
      ? store + (count ? " · " + count + (count === 1 ? " item" : " items") : "")
      : detail || "";
    render(
      '<button class="nova-close" id="nova-close" type="button" aria-label="Close">×</button>' +
        '<div class="nova-kicker">Nova · cart code</div>' +
        '<div class="nova-code">' +
        escapeHtml(code) +
        "</div>" +
        (subtitle ? '<div class="nova-store">' + escapeHtml(subtitle) + "</div>" : "") +
        itemListHtml(cart) +
        '<button class="nova-btn" id="nova-copy" type="button">Copy code</button>' +
        '<div class="nova-hint">Paste it in Discord and hit Start Order.</div>'
    );
    var copyBtn = card.querySelector("#nova-copy");
    if (copyBtn) {
      copyBtn.onclick = function () {
        copyCode(code, copyBtn);
      };
    }
  }

  function friendlyError(raw) {
    var text = String(raw || "").replace(/\s+/g, " ").trim();
    var lower = text.toLowerCase();
    if (/empty/.test(lower)) {
      return "Your cart looks empty. Add your items, then tap the bookmark again.";
    }
    if (/not on wonder|open your cart on/.test(lower) && !/ajax|404|401|403/.test(lower)) {
      return "Open your cart on wonder.com first, then tap the bookmark again.";
    }
    if (/could not load|not responding|check your connection/.test(lower)) {
      return "The cart service didn't respond. Check your connection, refresh, then tap the bookmark again.";
    }
    if (
      /\/order\/ajax/.test(text) ||
      /checkout/.test(lower) ||
      /→\s*\d{3}/.test(text) ||
      /\b40[134]\b/.test(text) ||
      /\b50\d\b/.test(text) ||
      /sign in/.test(lower) ||
      /couldn't read/.test(lower) ||
      /hmac|menu-item/.test(lower)
    ) {
      return "We couldn't read your cart. Remove the items, add them again, then tap the bookmark.";
    }
    if (!text || /ajax|hmac|404|500/.test(lower)) {
      return "We couldn't read your cart. Remove the items, add them again, then tap the bookmark.";
    }
    return text;
  }

  function failure(message) {
    stop();
    render(
      '<button class="nova-close" id="nova-close" type="button" aria-label="Close">×</button>' +
        '<div class="nova-kicker">Nova</div>' +
        '<div class="nova-err" style="margin-top:10px">' +
        escapeHtml(friendlyError(message)) +
        "</div>"
    );
  }

  loading();
  document.body.appendChild(host);

  var ADAPTERS = {
    wonder: {
      host: "www.wonder.com",
      owns: function (node) {
        return node.id === UPSTREAM_PANEL_ID;
      },
      start: function (node) {
        if (node.getAttribute("data-nova-autostart") === "1") return;
        var upstreamAction = node.querySelector("#wonder-cart-grabber-action");
        if (!upstreamAction || typeof upstreamAction.click !== "function") return;
        node.setAttribute("data-nova-autostart", "1");
        upstreamAction.click();
      },
      read: function (node) {
        var result = node.querySelector("#wonder-cart-grabber-result");
        var copyButton = result && result.querySelector("#wonder-cart-grabber-copy");
        if (copyButton && copyButton.previousElementSibling) {
          var code = (copyButton.previousElementSibling.textContent || "").trim();
          if (code) {
            var detailNode = result.firstElementChild;
            return {
              code: code,
              detail: detailNode ? (detailNode.textContent || "").trim() : "",
            };
          }
        }
        if (result && result.style.display && result.style.display !== "none") {
          var error = (result.textContent || "").trim();
          if (error) return { error: error };
        }
        return null;
      },
    },
    yonder: {
      host: "www.wonder.com",
      owns: function (node) {
        return node.id === "wa-grab";
      },
      read: function (node) {
        var codeNode = node.querySelector(".wa-code");
        if (codeNode) {
          var detailNode = codeNode.nextElementSibling;
          if (detailNode && (detailNode.id === "wa-hint" || /tap the code/i.test(detailNode.textContent || ""))) {
            detailNode = detailNode.nextElementSibling;
          }
          return {
            code: (codeNode.textContent || "").trim(),
            detail: detailNode ? (detailNode.textContent || "").trim() : "",
          };
        }
        if ((node.style.borderColor || "").replace(/\s/g, "").indexOf("237,66,69") >= 0) {
          return { error: node.textContent || "" };
        }
        return null;
      },
    },
  };
  var ADAPTER = ADAPTERS[PROVIDER];

  var bar = null;
  var seen = "";

  function isGrabBar(node) {
    if (!node || node.nodeType !== 1 || node === host) return false;
    return ADAPTER.owns(node);
  }

  function sync() {
    if (!bar || settled) return;
    var text = bar.textContent || "";
    if (text === seen) return;
    seen = text;
    var state = ADAPTER.read(bar);
    if (!state) return;
    if (state.error) failure(state.error);
    else success(state.code, state.detail);
  }

  observer = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var added = records[i].addedNodes || [];
      for (var j = 0; j < added.length; j++) {
        if (isGrabBar(added[j])) {
          bar = added[j];
          hideUpstreamPanel(bar);
          if (ADAPTER.start) ADAPTER.start(bar);
        }
      }
    }
    sync();
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  poll = setInterval(sync, 250);

  setTimeout(function () {
    if (!bar && !settled) {
      if (loaded)
        failure("Could not read the cart code. Refresh your cart and tap the bookmark again.");
      else
        failure("The cart service is not responding. Give it a moment and tap the bookmark again.");
    }
  }, 45000);

  var pageHost = location.hostname || "";
  if (ADAPTER.host && pageHost !== ADAPTER.host && pageHost !== "wonder.com") {
    failure("Open your cart on wonder.com first, then tap the bookmark again.");
    return;
  }

  var script = document.createElement("script");
  script.src = GRAB_SRC + (GRAB_SRC.indexOf("?") < 0 ? "?v=" : "&v=") + Date.now();
  script.onload = function () {
    loaded = true;
  };
  script.onerror = function () {
    failure("Could not load the cart grabber. Check your connection and tap the bookmark again.");
  };
  document.body.appendChild(script);
})();
