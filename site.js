(function () {
  "use strict";

  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const CHECKOUT_URL = "https://shop.chaingrapplers.com/cart/62506751459658:1?checkout";
  const CAMPAIGN_PARAMETERS = [
    "utm_id",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ];

  function checkoutUrlWithCampaignParameters(url = CHECKOUT_URL) {
    const checkoutUrl = new URL(url, window.location.href);
    const shouldStartCheckout = checkoutUrl.searchParams.has("checkout");
    checkoutUrl.searchParams.delete("checkout");
    const pageParameters = new URLSearchParams(window.location.search);
    CAMPAIGN_PARAMETERS.forEach((parameter) => {
      const value = pageParameters.get(parameter);
      if (value) checkoutUrl.searchParams.set(parameter, value);
    });
    if (shouldStartCheckout) {
      const remainingParameters = checkoutUrl.searchParams.toString();
      checkoutUrl.search = `?checkout${remainingParameters ? `&${remainingParameters}` : ""}`;
    }
    return checkoutUrl.toString();
  }

  function currentLanguage() {
    return document.documentElement.lang.toLowerCase().startsWith("sv") ? "sv" : "en";
  }

  function labels() {
    return currentLanguage() === "sv"
      ? {
          menu: "Meny",
          openMenu: "Öppna menyn",
          closeMenu: "Stäng menyn",
          checkoutTitle: "Shopify-kassan är öppen",
          checkoutCopy: "Slutför köpet i det säkra kassafönstret. Den här sidan ligger kvar bakom.",
          reopen: "Fortsätt till kassan",
          cancel: "Stäng meddelandet",
        }
      : {
          menu: "Menu",
          openMenu: "Open menu",
          closeMenu: "Close menu",
          checkoutTitle: "Shopify checkout is open",
          checkoutCopy: "Complete your order in the secure checkout window. This page stays open behind it.",
          reopen: "Continue to checkout",
          cancel: "Dismiss",
      };
  }

  function currentFile() {
    if (window.location.pathname.endsWith("/")) return "index.html";
    return window.location.pathname.split("/").filter(Boolean).pop() || "index.html";
  }

  function languagePath(lang) {
    const currentPath = window.location.pathname;
    const onEnglishRoute = /^\/en(?:\/|$)/.test(currentPath);
    const file = currentFile();

    if (lang === "en") {
      if (onEnglishRoute) return currentPath;
      if (file === "bjj-kortspel.html") return "/en/bjj-card-game.html";
      if (["game.html", "about.html", "rules.html"].includes(file)) return `/en/${file}`;
      return "/en/";
    }

    if (!onEnglishRoute) return currentPath;
    if (file === "bjj-card-game.html") return "/bjj-kortspel.html";
    if (["game.html", "about.html", "rules.html"].includes(file)) return `/${file}`;
    return "/";
  }

  function enrichMenu(nav) {
    const swedish = currentLanguage() === "sv";
    const file = currentFile();
    const activeRoute = file === "index.html" ? "start" : file.replace(".html", "");
    const routes = [
      { key: "start", href: "./", label: swedish ? "Start" : "Home" },
      { key: "game", href: "game.html", label: "Demo" },
      { key: "about", href: "about.html", label: swedish ? "Om spelet" : "About" },
      { key: "rules", href: "rules.html", label: swedish ? "Regler" : "Rules" },
    ];

    nav.replaceChildren();
    routes.forEach((route) => {
      const link = document.createElement("a");
      link.className = "landing-nav-link";
      link.href = route.href;
      if (route.key === activeRoute) link.setAttribute("aria-current", "page");
      const title = document.createElement("span");
      title.textContent = route.label;
      link.append(title);
      nav.append(link);
    });

    const languageToggle = document.createElement("button");
    languageToggle.type = "button";
    languageToggle.className = `language-toggle${swedish ? "" : " is-english"}`;
    languageToggle.setAttribute("role", "switch");
    languageToggle.setAttribute("aria-checked", String(!swedish));
    languageToggle.setAttribute("aria-label", swedish ? "Byt till engelska" : "Switch to Swedish");
    languageToggle.innerHTML = `
      <span>SV</span>
      <span class="language-toggle__track" aria-hidden="true"><i></i></span>
      <span>EN</span>
    `;
    languageToggle.addEventListener("click", () => {
      const nextLanguage = currentLanguage() === "sv" ? "en" : "sv";
      localStorage.setItem("chaingrapplers-language", nextLanguage);
      window.location.assign(languagePath(nextLanguage));
    });
    nav.append(languageToggle);
  }

  function createMenu() {
    const header = document.querySelector(".landing-topbar");
    const nav = header?.querySelector(".landing-nav");
    if (!header || !nav || header.querySelector(".site-menu-toggle")) return;

    const navId = nav.id || "site-menu";
    nav.id = navId;
    nav.classList.add("site-menu-panel");
    enrichMenu(nav);

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "site-menu-toggle";
    toggle.setAttribute("aria-controls", navId);
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = `
      <span class="site-menu-toggle__label"></span>
      <span class="site-menu-toggle__icon" aria-hidden="true"><i></i><i></i></span>
    `;

    const menuHeader = document.createElement("div");
    menuHeader.className = "site-menu-panel__header";
    menuHeader.innerHTML = `
      <span class="site-menu-panel__title"></span>
      <button type="button" class="site-menu-close">
        <span class="site-menu-close__label"></span>
        <span aria-hidden="true">×</span>
      </button>
    `;
    nav.insertBefore(menuHeader, nav.firstChild);

    const backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "site-menu-backdrop";
    backdrop.tabIndex = -1;
    backdrop.setAttribute("aria-hidden", "true");

    header.appendChild(toggle);
    header.appendChild(backdrop);

    const closeButton = menuHeader.querySelector(".site-menu-close");
    let previouslyFocused = null;

    function updateLabels() {
      const text = labels();
      toggle.querySelector(".site-menu-toggle__label").textContent = text.menu;
      toggle.setAttribute("aria-label", text.openMenu);
      menuHeader.querySelector(".site-menu-panel__title").textContent = text.menu;
      closeButton.querySelector(".site-menu-close__label").textContent = text.closeMenu;
      closeButton.setAttribute("aria-label", text.closeMenu);
      backdrop.setAttribute("aria-label", text.closeMenu);
    }

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      backdrop.classList.toggle("is-open", open);
      document.body.classList.toggle("site-menu-is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      nav.setAttribute("aria-hidden", String(!open));

      if (open) {
        previouslyFocused = document.activeElement;
        nav.removeAttribute("inert");
        window.requestAnimationFrame(() => closeButton.focus());
      } else {
        nav.setAttribute("inert", "");
        if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
      }
    }

    toggle.addEventListener("click", () => setOpen(true));
    closeButton.addEventListener("click", () => setOpen(false));
    backdrop.addEventListener("click", () => setOpen(false));
    document.addEventListener("cg-close-menu", () => setOpen(false));

    document.addEventListener("keydown", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = [...nav.querySelectorAll(FOCUSABLE)].filter(
        (element) => !element.hasAttribute("inert") && element.offsetParent !== null
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener("cg-language-change", () => {
      updateLabels();
    });
    updateLabels();
    setOpen(false);
  }

  function createSupportBuyBar() {
    if (currentFile() !== "about.html" || document.querySelector(".mobile-buy-bar")) return;
    const swedish = currentLanguage() === "sv";
    document.body.classList.add("support-buy-page");
    const bar = document.createElement("aside");
    bar.className = "mobile-buy-bar mobile-buy-bar--support";
    bar.setAttribute("aria-label", swedish ? "Köp ChainGrapplers" : "Buy ChainGrapplers");
    bar.innerHTML = `
      <div><strong>ChainGrapplers</strong><span>${swedish ? "299 kr · Fri frakt" : "299 SEK · Free Swedish shipping"}</span></div>
      <a href="${CHECKOUT_URL}" data-shopify-checkout data-checkout-url="${CHECKOUT_URL}">
        ${swedish ? "Köp spelet" : "Buy the game"}
      </a>
    `;
    const footer = document.querySelector(".site-footer");
    if (footer) footer.before(bar);
    else document.body.append(bar);
  }

  function createCheckoutOverlay() {
    const triggers = [...document.querySelectorAll("[data-shopify-checkout]")];
    if (!triggers.length) return;

    triggers.forEach((trigger) => {
      const url = checkoutUrlWithCampaignParameters(trigger.dataset.checkoutUrl || trigger.href);
      trigger.href = url;
      trigger.dataset.checkoutUrl = url;
    });

    const overlay = document.createElement("div");
    overlay.className = "checkout-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="checkout-overlay__card" role="dialog" aria-modal="true" aria-labelledby="checkout-overlay-title">
        <div class="checkout-overlay__brand" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <p class="checkout-overlay__eyebrow">Shopify</p>
        <h2 id="checkout-overlay-title"></h2>
        <p class="checkout-overlay__copy"></p>
        <div class="checkout-overlay__actions">
          <button type="button" class="checkout-overlay__reopen"></button>
          <button type="button" class="checkout-overlay__close"></button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const title = overlay.querySelector("h2");
    const copy = overlay.querySelector(".checkout-overlay__copy");
    const reopen = overlay.querySelector(".checkout-overlay__reopen");
    const close = overlay.querySelector(".checkout-overlay__close");
    let checkoutWindow = null;
    let checkoutUrl = "";
    let returnFocus = null;

    function setBackgroundInert(inert) {
      [...document.body.children].forEach((element) => {
        if (element === overlay || element.tagName === "SCRIPT") return;
        if (inert && !element.hasAttribute("inert")) {
          element.setAttribute("inert", "");
          element.dataset.checkoutInert = "true";
        } else if (!inert && element.dataset.checkoutInert === "true") {
          element.removeAttribute("inert");
          delete element.dataset.checkoutInert;
        }
      });
    }

    function updateLabels() {
      const text = labels();
      title.textContent = text.checkoutTitle;
      copy.textContent = text.checkoutCopy;
      reopen.textContent = text.reopen;
      close.textContent = text.cancel;
    }

    function hideOverlay() {
      overlay.hidden = true;
      document.body.classList.remove("checkout-is-open");
      setBackgroundInert(false);
      if (returnFocus instanceof HTMLElement) returnFocus.focus();
    }

    function openPopup(url) {
      const width = Math.min(760, Math.max(420, window.screen.availWidth - 80));
      const height = Math.min(920, Math.max(620, window.screen.availHeight - 80));
      const left = Math.max(0, Math.round((window.screen.availWidth - width) / 2));
      const top = Math.max(0, Math.round((window.screen.availHeight - height) / 2));
      const features = `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
      checkoutWindow = window.open(url, "chaingrapplers-shopify-checkout", features);
      if (!checkoutWindow) return false;
      checkoutWindow.focus();
      return true;
    }

    function beginCheckout(url, trigger) {
      checkoutUrl = url;
      returnFocus = trigger.closest(".site-menu-panel")
        ? document.querySelector(".site-menu-toggle")
        : trigger;
      updateLabels();
      document.dispatchEvent(new CustomEvent("cg-close-menu"));

      if (window.matchMedia("(max-width: 719px)").matches) {
        window.location.assign(url);
        return;
      }

      if (!openPopup(url)) {
        window.location.assign(url);
        return;
      }

      overlay.hidden = false;
      document.body.classList.add("checkout-is-open");
      setBackgroundInert(true);
      window.requestAnimationFrame(() => close.focus());
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        const url = checkoutUrlWithCampaignParameters(trigger.dataset.checkoutUrl || trigger.href);
        if (!url || event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        beginCheckout(url, trigger);
      });
    });

    reopen.addEventListener("click", () => {
      if (!openPopup(checkoutUrl)) window.location.assign(checkoutUrl);
    });
    close.addEventListener("click", hideOverlay);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) hideOverlay();
    });
    document.addEventListener("keydown", (event) => {
      if (overlay.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        hideOverlay();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...overlay.querySelectorAll(FOCUSABLE)].filter((element) => !element.hidden);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    window.addEventListener("cg-language-change", updateLabels);
    updateLabels();
  }

  document.addEventListener("DOMContentLoaded", () => {
    createMenu();
    createSupportBuyBar();
    createCheckoutOverlay();
  });
})();
