(function () {
  "use strict";

  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
          reopen: "Öppna kassan igen",
          cancel: "Stäng kassan",
        }
      : {
          menu: "Menu",
          openMenu: "Open menu",
          closeMenu: "Close menu",
          checkoutTitle: "Shopify checkout is open",
          checkoutCopy: "Complete your order in the secure checkout window. This page stays open behind it.",
          reopen: "Open checkout again",
          cancel: "Close checkout",
      };
  }

  function menuDescription(href) {
    const swedish = currentLanguage() === "sv";
    const value = String(href || "").toLowerCase();
    if (value.includes("game.html")) {
      return swedish ? "Känn hur kortkedjan fungerar direkt i webbläsaren." : "Feel how the card chain works in your browser.";
    }
    if (value.includes("rules.html")) {
      return swedish ? "Regler, specialkort och hur en match avgörs." : "Rules, special cards, and how a match is decided.";
    }
    if (value.includes("about.html")) {
      return swedish ? "Positioner, press, escapes och submissions." : "Positions, pressure, escapes, and submissions.";
    }
    if (value.includes("bjj-kortspel") || value.includes("bjj-card-game")) {
      return swedish ? "För barn, familjer, lagkamrater och BJJ-klubbar." : "For kids, families, teammates, and BJJ academies.";
    }
    if (value.includes("shop.chaingrapplers.com") || value.includes("buy.html")) {
      return swedish ? "Se produktdetaljerna i vår säkra butik." : "See every product detail in our secure store.";
    }
    if (value === "./" || value.endsWith("index.html")) {
      return swedish ? "Produkten, priset och det viktigaste först." : "The product, price, and essentials first.";
    }
    if (value.includes("../") || value.includes("/en")) {
      return swedish ? "Byt språk för hela webbplatsen." : "Switch language for the full website.";
    }
    return swedish ? "Utforska mer om ChainGrapplers." : "Explore more of ChainGrapplers.";
  }

  function enrichMenu(nav) {
    const links = [...nav.querySelectorAll(":scope > a")];
    const hasHome = links.some((link) => {
      const href = link.getAttribute("href") || "";
      return href === "./" || href === "index.html";
    });

    if (!hasHome) {
      const home = document.createElement("a");
      home.className = "landing-nav-link";
      home.href = currentLanguage() === "sv" ? "index.html" : "./";
      home.textContent = currentLanguage() === "sv" ? "Kortspelet" : "The card game";
      nav.insertBefore(home, nav.firstChild);
    }

    nav.querySelectorAll(":scope > a").forEach((link) => {
      if (link.querySelector("span")) return;
      const linkLabel = link.textContent.trim();
      const description = menuDescription(link.getAttribute("href"));
      link.textContent = "";
      const title = document.createElement("span");
      const detail = document.createElement("small");
      title.textContent = linkLabel;
      detail.textContent = description;
      detail.dataset.siteMenuDescription = "true";
      link.append(title, detail);
    });
  }

  function updateMenuDescriptions(nav) {
    nav.querySelectorAll("[data-site-menu-description]").forEach((detail) => {
      detail.textContent = menuDescription(detail.closest("a")?.getAttribute("href"));
    });
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
    document.body.appendChild(backdrop);

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
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

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
      updateMenuDescriptions(nav);
    });
    updateLabels();
    setOpen(false);
  }

  function createCheckoutOverlay() {
    const triggers = [...document.querySelectorAll("[data-shopify-checkout]")];
    if (!triggers.length) return;

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
    let popupWatch = null;

    function updateLabels() {
      const text = labels();
      title.textContent = text.checkoutTitle;
      copy.textContent = text.checkoutCopy;
      reopen.textContent = text.reopen;
      close.textContent = text.cancel;
    }

    function hideOverlay(closeWindow) {
      if (closeWindow && checkoutWindow && !checkoutWindow.closed) checkoutWindow.close();
      window.clearInterval(popupWatch);
      popupWatch = null;
      overlay.hidden = true;
      document.body.classList.remove("checkout-is-open");
    }

    function watchPopup() {
      window.clearInterval(popupWatch);
      popupWatch = window.setInterval(() => {
        if (!checkoutWindow || checkoutWindow.closed) hideOverlay(false);
      }, 600);
    }

    function openPopup(url) {
      const width = Math.min(760, Math.max(420, window.screen.availWidth - 80));
      const height = Math.min(920, Math.max(620, window.screen.availHeight - 80));
      const left = Math.max(0, Math.round((window.screen.availWidth - width) / 2));
      const top = Math.max(0, Math.round((window.screen.availHeight - height) / 2));
      const features = `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
      checkoutWindow = window.open(url, "chaingrapplers-shopify-checkout", features);
      if (!checkoutWindow) return false;
      try {
        checkoutWindow.opener = null;
      } catch (_) {
        // Shopify is a trusted cross-origin checkout; browsers may lock this property.
      }
      checkoutWindow.focus();
      return true;
    }

    function beginCheckout(url) {
      checkoutUrl = url;
      updateLabels();

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
      watchPopup();
      window.requestAnimationFrame(() => close.focus());
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        const url = trigger.dataset.checkoutUrl || trigger.href;
        if (!url || event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        beginCheckout(url);
      });
    });

    reopen.addEventListener("click", () => {
      if (!checkoutWindow || checkoutWindow.closed) openPopup(checkoutUrl);
      else checkoutWindow.focus();
      watchPopup();
    });
    close.addEventListener("click", () => hideOverlay(true));
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) hideOverlay(true);
    });
    document.addEventListener("keydown", (event) => {
      if (!overlay.hidden && event.key === "Escape") hideOverlay(true);
    });
    window.addEventListener("cg-language-change", updateLabels);
    updateLabels();
  }

  document.addEventListener("DOMContentLoaded", () => {
    createMenu();
    createCheckoutOverlay();
  });
})();
