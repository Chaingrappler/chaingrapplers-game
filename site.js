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
        }
      : {
          menu: "Menu",
          openMenu: "Open menu",
          closeMenu: "Close menu",
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
      if (["game.html", "about.html", "rules.html", "buy.html"].includes(file)) return `/en/${file}`;
      return "/en/";
    }

    if (!onEnglishRoute) return currentPath;
    if (file === "bjj-card-game.html") return "/bjj-kortspel.html";
    if (["game.html", "about.html", "rules.html", "buy.html"].includes(file)) return `/${file}`;
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
      { key: "buy", href: "buy.html", label: swedish ? "Förfrågan" : "Enquire" },
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
    bar.setAttribute("aria-label", swedish ? "Fråga om ChainGrapplers" : "Enquire about ChainGrapplers");
    bar.innerHTML = `
      <div><strong>ChainGrapplers</strong><span>${swedish ? "Pris och tillgänglighet via mejl" : "Price and availability by email"}</span></div>
      <a href="buy.html">
        ${swedish ? "Fråga om spelet" : "Enquire about the game"}
      </a>
    `;
    const footer = document.querySelector(".site-footer");
    if (footer) footer.before(bar);
    else document.body.append(bar);
  }

  document.addEventListener("DOMContentLoaded", () => {
    createMenu();
    createSupportBuyBar();
  });
})();
