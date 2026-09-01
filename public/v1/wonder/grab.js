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

  function hideUpstreamPanel(node) {
    if (!node) return;
    node.style.display = "none";
    node.style.visibility = "hidden";
    node.style.pointerEvents = "none";
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

  var host = document.createElement("div");
  host.setAttribute("data-nova-grabber", "1");
  host.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;background:rgba(7,7,13,.72);" +
    "backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;" +
    "font:15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

  var card = document.createElement("div");
  card.style.cssText =
    "width:min(360px,calc(100vw - 40px));background:#11111d;color:#f7f7fa;border-radius:18px;" +
    "border:1px solid rgba(248,192,0,.35);box-shadow:0 24px 64px rgba(0,0,0,.55);padding:26px 24px;text-align:center";
  host.appendChild(card);

  var style = document.createElement("style");
  style.textContent =
    "@keyframes novaSpin{to{transform:rotate(360deg)}}" +
    "@keyframes novaPulse{0%,100%{opacity:.35}50%{opacity:1}}" +
    "@keyframes novaRise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}" +
    ".nova-loader{position:relative;width:56px;height:56px;margin:0 auto 18px}" +
    ".nova-arc{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(255,255,255,.14);" +
    "border-top-color:" + GOLD + ";animation:novaSpin 1.1s linear infinite}" +
    ".nova-step{font-size:13px;color:#9aa0aa;animation:novaPulse 1.6s ease-in-out infinite}" +
    ".nova-in{animation:novaRise .28s ease-out}" +
    ".nova-code{font:700 34px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.16em;" +
    "color:" + GOLD + ";margin:14px 0 6px;user-select:all;-webkit-user-select:all}" +
    ".nova-btn{width:100%;margin-top:18px;padding:13px;border:0;border-radius:11px;background:" + GOLD + ";" +
    "color:#07070d;font-size:15px;font-weight:700;cursor:pointer}" +
    ".nova-ghost{width:100%;margin-top:9px;padding:10px;border:0;border-radius:11px;background:transparent;color:#7d838d;font-size:13px;cursor:pointer}";
  document.head.appendChild(style);

  function render(html) {
    card.innerHTML = html;
    card.className = "nova-in";
  }

  function close() {
    stop();
    if (host.parentNode) host.parentNode.removeChild(host);
    window.__novaGrabBusy = false;
  }

  var STEPS = ["Reading your cart", "Checking your address", "Pricing your items", "Minting your code"];
  var stepIndex = 0;

  function loading() {
    render(
      '<div class="nova-loader"><div class="nova-arc"></div></div>' +
        '<div style="font-size:17px;font-weight:600">Grabbing your cart</div>' +
        '<div class="nova-step" id="nova-step" style="margin-top:8px">' + STEPS[0] + "</div>" +
        '<div style="margin-top:18px;font-size:11px;letter-spacing:.18em;color:#f8c000">NOVA</div>'
    );
  }

  var ticker = setInterval(function () {
    var node = document.getElementById("nova-step");
    if (!node) return;
    stepIndex = (stepIndex + 1) % STEPS.length;
    node.textContent = STEPS[stepIndex];
  }, 1400);

  var settled = false;
  var loaded = false;
  var poll = null;
  var observer = null;

  function stop() {
    settled = true;
    clearInterval(ticker);
    if (poll) clearInterval(poll);
    if (observer) observer.disconnect();
  }

  function success(code, detail) {
    stop();
    render(
      '<div style="font-size:12px;letter-spacing:.16em;color:#f8c000">NOVA · CART CODE</div>' +
        '<div class="nova-code">' + code + "</div>" +
        '<div style="font-size:12px;color:#9aa0aa">' + (detail || "") + "</div>" +
        '<button class="nova-btn" id="nova-copy">Copy code</button>' +
        '<div style="margin-top:14px;font-size:12px;color:#9aa0aa;line-height:1.5">' +
        "Back in Discord, hit <b style=\"color:#fff\">Start Order</b> and paste it.</div>" +
        '<button class="nova-ghost" id="nova-close">Close</button>'
    );
    document.getElementById("nova-close").onclick = close;
    var button = document.getElementById("nova-copy");
    button.onclick = function () {
      var done = function () {
        button.textContent = "Copied ✓";
      };
      var failed = function () {
        button.textContent = "Copy failed — select the code above";
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
    };
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
      return "The cart service didn't respond. Check your connection, refresh the page, then tap the bookmark again.";
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
      return "We couldn't read your cart. Make sure items are in your cart — remove them, re-add them, then click the bookmark again.";
    }
    if (!text || /ajax|hmac|404|500/.test(lower)) {
      return "We couldn't read your cart. Make sure items are in your cart — remove them, re-add them, then click the bookmark again.";
    }
    return text;
  }

  function failure(message) {
    stop();
    render(
      '<div style="font-size:26px">⚠️</div>' +
        '<div style="margin-top:10px;font-size:15px;line-height:1.5">' +
        friendlyError(message) +
        "</div>" +
        '<button class="nova-ghost" id="nova-close" style="margin-top:16px">Close</button>'
    );
    document.getElementById("nova-close").onclick = close;
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
