/* ==========================================================================
   SHINKAI — core.js
   Motor compartilhado por TODAS as páginas. Depende de data.js (carregado antes).
   Expõe window.Shinkai com módulos reutilizáveis: state, Cart, Wishlist,
   Toast, Header, Search, RevealAnimations, ProductCard (template).

   Nada aqui usa localStorage — o estado vive em memória durante a sessão
   da aba (compatível com o sandbox de preview). Quando o backend existir,
   troque `state.cart` por chamadas de API dentro do CartAPI abaixo.
   ========================================================================== */

window.Shinkai = (function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Utilitários                                                         */
  /* ------------------------------------------------------------------ */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const formatBRL = (value) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (isoString) =>
    new Date(isoString).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const debounce = (fn, delay = 200) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const discountPercent = (product) => {
    if (!product.oldPrice) return 0;
    return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
  };

  const seasonLabel = (id) => SEASONS.find((s) => s.id === id)?.label || id;
  const seasonIcon = (id) => SEASONS.find((s) => s.id === id)?.icon || "fa-circle";

  const getProductById = (id) => PRODUCTS.find((p) => p.id === id);

  const qs = (name) => new URLSearchParams(window.location.search).get(name);

  /* ------------------------------------------------------------------ */
  /* Estado global (em memória — sem localStorage)                       */
  /* ------------------------------------------------------------------ */
  const state = {
    cart: [], // { productId, size, qty }
    wishlist: new Set(),
    currentUser: null, // { name, email } — preenchido pelo LoginModule
  };

  /* ------------------------------------------------------------------ */
  /* Toast                                                               */
  /* ------------------------------------------------------------------ */
  const Toast = (() => {
    let toastEl;
    let hideTimer;

    const ensureEl = () => {
      if (toastEl) return toastEl;
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.id = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
      return toastEl;
    };

    const show = (message, duration = 2600) => {
      const el = $("#toast") || ensureEl();
      el.textContent = message;
      el.classList.add("is-visible");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => el.classList.remove("is-visible"), duration);
    };

    return { show };
  })();

  /* ------------------------------------------------------------------ */
  /* Overlay compartilhado (menu / painéis)                              */
  /* ------------------------------------------------------------------ */
  const Overlay = (() => {
    let onClose = null;

    const getEl = () => $("#overlay");

    const show = (closeCallback) => {
      const el = getEl();
      if (!el) return;
      onClose = closeCallback;
      el.classList.add("is-visible");
      document.body.style.overflow = "hidden";
    };

    const hide = () => {
      const el = getEl();
      if (!el) return;
      el.classList.remove("is-visible");
      document.body.style.overflow = "";
      onClose = null;
    };

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && onClose) onClose();
    });

    document.addEventListener("click", (e) => {
      if (e.target === getEl() && onClose) onClose();
    });

    return { show, hide };
  })();

  /* ------------------------------------------------------------------ */
  /* Cart — usado por todas as páginas (header mini-carrinho + página)   */
  /* ------------------------------------------------------------------ */
  const Cart = (() => {
    const findLine = (productId, size) =>
      state.cart.find((line) => line.productId === productId && line.size === size);

    const addItem = (product, size, qty = 1) => {
      const existing = findLine(product.id, size);
      if (existing) {
        existing.qty += qty;
      } else {
        state.cart.push({ productId: product.id, size, qty });
      }
      renderAll();
      Toast.show(`${product.name} (${size}) adicionado ao carrinho`);
    };

    const updateQty = (productId, size, delta) => {
      const line = findLine(productId, size);
      if (!line) return;
      line.qty += delta;
      if (line.qty <= 0) {
        state.cart = state.cart.filter((l) => l !== line);
      }
      renderAll();
    };

    const removeItem = (productId, size) => {
      state.cart = state.cart.filter((l) => !(l.productId === productId && l.size === size));
      renderAll();
    };

    const clear = () => {
      state.cart = [];
      renderAll();
    };

    const getLines = () =>
      state.cart
        .map((line) => ({ ...line, product: getProductById(line.productId) }))
        .filter((line) => line.product);

    const getSubtotal = () =>
      getLines().reduce((total, line) => total + line.product.price * line.qty, 0);

    const getTotalQty = () => state.cart.reduce((sum, l) => sum + l.qty, 0);

    /* --- Renderização do badge no header (presente em toda página) --- */
    const renderBadge = () => {
      const badge = $("#cartCount");
      if (!badge) return;
      const qty = getTotalQty();
      badge.textContent = String(qty);
      badge.hidden = qty === 0;
    };

    /* --- Renderização do drawer rápido (header) --- */
    const renderDrawer = () => {
      const itemsEl = $("#cartItems");
      const emptyEl = $("#cartEmpty");
      const footerEl = $("#cartFooter");
      const subtotalEl = $("#cartSubtotal");
      if (!itemsEl) return; // página não tem drawer (não deveria acontecer, mas defensivo)

      const lines = getLines();
      const isEmpty = lines.length === 0;
      if (emptyEl) emptyEl.hidden = !isEmpty;
      if (footerEl) footerEl.hidden = isEmpty;
      itemsEl.hidden = isEmpty;

      itemsEl.innerHTML = lines
        .map(
          (line) => `
          <div class="cart-item" data-product-id="${line.product.id}" data-size="${line.size}">
            <img src="${line.product.image}" alt="${line.product.name}" />
            <div>
              <p class="cart-item__name">${line.product.name}</p>
              <p class="cart-item__meta">Tamanho: ${line.size}</p>
              <p class="cart-item__price">${formatBRL(line.product.price * line.qty)}</p>
              <div class="cart-item__qty">
                <button data-qty="-1" aria-label="Diminuir quantidade">−</button>
                <span>${line.qty}</span>
                <button data-qty="1" aria-label="Aumentar quantidade">+</button>
              </div>
            </div>
            <button class="cart-item__remove" data-remove aria-label="Remover item">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>`
        )
        .join("");

      if (subtotalEl) subtotalEl.textContent = formatBRL(getSubtotal());
    };

    const renderAll = () => {
      renderBadge();
      renderDrawer();
      // Se a página do carrinho completo estiver montada, ela escuta este evento:
      document.dispatchEvent(new CustomEvent("shinkai:cart-changed"));
    };

    const bindDrawerEvents = () => {
      const itemsEl = $("#cartItems");
      if (!itemsEl) return;

      itemsEl.addEventListener("click", (e) => {
        const itemEl = e.target.closest(".cart-item");
        if (!itemEl) return;
        const { productId, size } = itemEl.dataset;

        const qtyBtn = e.target.closest("[data-qty]");
        if (qtyBtn) {
          updateQty(productId, size, Number(qtyBtn.dataset.qty));
          return;
        }
        if (e.target.closest("[data-remove]")) {
          removeItem(productId, size);
        }
      });

      const emptyCta = $("#cartEmptyCta");
      if (emptyCta) {
        emptyCta.addEventListener("click", () => {
          window.location.href = "catalogo.html";
        });
      }
    };

    const openDrawer = () => {
      const drawer = $("#cartDrawer");
      if (!drawer) return;
      drawer.hidden = false;
      Overlay.show(closeDrawer);
    };

    const closeDrawer = () => {
      const drawer = $("#cartDrawer");
      if (!drawer) return;
      drawer.hidden = true;
      Overlay.hide();
    };

    const bindToggle = () => {
      const toggleBtn = $("#cartToggle");
      const closeBtn = $("#cartClose");
      if (toggleBtn) toggleBtn.addEventListener("click", openDrawer);
      if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    };

    const init = () => {
      bindToggle();
      bindDrawerEvents();
      renderAll();
    };

    return {
      init,
      addItem,
      updateQty,
      removeItem,
      clear,
      getLines,
      getSubtotal,
      getTotalQty,
      openDrawer,
      closeDrawer,
      renderAll,
    };
  })();

  /* ------------------------------------------------------------------ */
  /* Wishlist                                                            */
  /* ------------------------------------------------------------------ */
  const Wishlist = (() => {
    const has = (productId) => state.wishlist.has(productId);

    const toggle = (product) => {
      if (state.wishlist.has(product.id)) {
        state.wishlist.delete(product.id);
      } else {
        state.wishlist.add(product.id);
        Toast.show(`${product.name} adicionada aos favoritos`);
      }
      renderBadge();
      document.dispatchEvent(new CustomEvent("shinkai:wishlist-changed"));
      return state.wishlist.has(product.id);
    };

    const renderBadge = () => {
      const badge = $("#wishlistCount");
      if (!badge) return;
      const count = state.wishlist.size;
      badge.textContent = String(count);
      badge.hidden = count === 0;
    };

    const init = () => renderBadge();

    return { has, toggle, init };
  })();

  /* ------------------------------------------------------------------ */
  /* Template de card de produto (usado em Home, Catálogo e Busca)       */
  /* ------------------------------------------------------------------ */
  const ProductCard = {
    render(product) {
      const pct = discountPercent(product);
      const isWished = Wishlist.has(product.id);
      const lowStock = product.stock > 0 && product.stock <= 10;

      return `
        <li class="product-card" data-product-id="${product.id}" data-reveal>
          <div class="product-card__media">
            <div class="product-card__badges">
              ${product.bestSeller ? '<span class="badge-pill badge-pill--bestseller">Mais vendida</span>' : ""}
              ${product.isNew ? '<span class="badge-pill badge-pill--new">Novo</span>' : ""}
              ${pct > 0 ? `<span class="badge-pill badge-pill--discount">-${pct}%</span>` : ""}
            </div>
            <button class="product-card__wishlist ${isWished ? "is-active" : ""}"
                    data-wishlist-btn aria-label="Adicionar aos favoritos" aria-pressed="${isWished}">
              <i class="fa-${isWished ? "solid" : "regular"} fa-heart"></i>
            </button>
            <a href="produto.html?id=${product.id}">
              <img src="${product.image}" alt="${product.name}" loading="lazy" />
              ${
                product.gallery && product.gallery[1]
                  ? `<img class="product-card__img-alt" src="${product.gallery[1]}" alt="" loading="lazy" />`
                  : ""
              }
            </a>
            <div class="product-card__quickadd">
              <button class="product-card__add" data-quick-add>
                <i class="fa-solid fa-cart-plus"></i> Adicionar
              </button>
            </div>
          </div>
          <div class="product-card__body">
            <p class="product-card__anime">${product.anime}</p>
            <h3 class="product-card__name"><a href="produto.html?id=${product.id}">${product.name}</a></h3>
            <p class="product-card__price">
              ${formatBRL(product.price)}
              ${product.oldPrice ? `<small>${formatBRL(product.oldPrice)}</small>` : ""}
            </p>
            ${
              lowStock
                ? `<p class="product-card__stock"><i class="fa-solid fa-triangle-exclamation"></i> Últimas ${product.stock} unidades</p>`
                : ""
            }
            <div class="product-card__sizes" role="group" aria-label="Selecionar tamanho">
              ${product.sizes
                .map((size, i) => `<button class="size-btn ${i === 0 ? "is-selected" : ""}" data-size="${size}">${size}</button>`)
                .join("")}
            </div>
            <button class="product-card__add" data-add-to-cart>
              <i class="fa-solid fa-cart-plus"></i> Adicionar
            </button>
          </div>
        </li>`;
    },

    /** Delega clique dentro de um container que tenha cards renderizados. */
    bindEvents(container) {
      if (!container || container.dataset.boundCardEvents) return;
      container.dataset.boundCardEvents = "true";

      container.addEventListener("click", (e) => {
        const card = e.target.closest(".product-card");
        if (!card) return;
        const product = getProductById(card.dataset.productId);
        if (!product) return;

        // Seleção de tamanho
        const sizeBtn = e.target.closest("[data-size]");
        if (sizeBtn) {
          $$(".size-btn", card).forEach((btn) => btn.classList.remove("is-selected"));
          sizeBtn.classList.add("is-selected");
          return;
        }

        // Wishlist
        const wishBtn = e.target.closest("[data-wishlist-btn]");
        if (wishBtn) {
          const isNowWished = Wishlist.toggle(product);
          wishBtn.classList.toggle("is-active", isNowWished);
          wishBtn.querySelector("i").className = `fa-${isNowWished ? "solid" : "regular"} fa-heart`;
          wishBtn.setAttribute("aria-pressed", String(isNowWished));
          return;
        }

        // Adicionar ao carrinho (botão principal ou quick-add sobre a imagem)
        const addBtn = e.target.closest("[data-add-to-cart], [data-quick-add]");
        if (addBtn) {
          const selectedSize = $(".size-btn.is-selected", card)?.dataset.size || product.sizes[0];
          Cart.addItem(product, selectedSize);
          const mainBtn = $("[data-add-to-cart]", card);
          if (mainBtn) {
            mainBtn.classList.add("is-added");
            mainBtn.innerHTML = '<i class="fa-solid fa-check"></i> Adicionado';
            setTimeout(() => {
              mainBtn.classList.remove("is-added");
              mainBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Adicionar';
            }, 1400);
          }
        }
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Reveal on scroll (IntersectionObserver)                             */
  /* ------------------------------------------------------------------ */
  const Reveal = (() => {
    let observer;

    const init = () => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      observeAll();
    };

    const observeAll = () => {
      if (!observer) return;
      $$("[data-reveal]").forEach((el) => {
        if (!el.classList.contains("is-revealed")) observer.observe(el);
      });
    };

    return { init, observeAll };
  })();

  /* ------------------------------------------------------------------ */
  /* Header: scroll state + menu mobile + nav ativa                      */
  /* ------------------------------------------------------------------ */
  const Header = (() => {
    const onScroll = () => {
      const header = $("#header");
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    const closeNav = () => {
      const nav = $("#navMenu");
      const toggle = $("#navToggle");
      if (!nav || !toggle) return;
      nav.classList.remove("is-open");
      toggle.classList.remove("is-active");
      toggle.setAttribute("aria-expanded", "false");
      Overlay.hide();
    };

    const toggleNav = () => {
      const nav = $("#navMenu");
      const toggle = $("#navToggle");
      if (!nav || !toggle) return;
      const isOpen = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-active", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        Overlay.show(closeNav);
      } else {
        Overlay.hide();
      }
    };

    /** Marca o link do menu correspondente à página atual como ativo. */
    const markActivePage = () => {
      const page = window.location.pathname.split("/").pop() || "index.html";
      $$("[data-nav-link]").forEach((link) => {
        const href = link.getAttribute("href");
        link.classList.toggle("is-active", href === page);
      });
    };

    const init = () => {
      window.addEventListener("scroll", onScroll, { passive: true });
      const toggle = $("#navToggle");
      if (toggle) toggle.addEventListener("click", toggleNav);
      $$("[data-nav-link]").forEach((link) => link.addEventListener("click", closeNav));
      markActivePage();
      onScroll();
    };

    return { init, closeNav };
  })();

  /* ------------------------------------------------------------------ */
  /* Busca global (painel no header, presente em toda página)            */
  /* ------------------------------------------------------------------ */
  const Search = (() => {
    const render = (query) => {
      const resultsEl = $("#searchResults");
      if (!resultsEl) return;
      const q = query.trim().toLowerCase();
      if (!q) {
        resultsEl.innerHTML = "";
        return;
      }

      const matches = PRODUCTS.filter(
        (p) => p.name.toLowerCase().includes(q) || p.anime.toLowerCase().includes(q)
      ).slice(0, 12);

      if (!matches.length) {
        resultsEl.innerHTML = `<p class="search-panel__empty">Nenhum resultado para "${query}".</p>`;
        return;
      }

      resultsEl.innerHTML = matches
        .map(
          (p) => `
          <a class="search-result" href="produto.html?id=${p.id}">
            <img src="${p.image}" alt="${p.name}" loading="lazy" />
            <strong>${p.name}</strong>
            <span>${formatBRL(p.price)}</span>
          </a>`
        )
        .join("");
    };

    const open = () => {
      const panel = $("#searchPanel");
      const toggleBtn = $("#searchToggle");
      if (!panel) return;
      panel.hidden = false;
      if (toggleBtn) toggleBtn.classList.add("is-active");
      Overlay.show(close);
      requestAnimationFrame(() => $("#searchInput")?.focus());
    };

    const close = () => {
      const panel = $("#searchPanel");
      const toggleBtn = $("#searchToggle");
      const input = $("#searchInput");
      if (!panel) return;
      panel.hidden = true;
      if (toggleBtn) toggleBtn.classList.remove("is-active");
      if (input) input.value = "";
      const resultsEl = $("#searchResults");
      if (resultsEl) resultsEl.innerHTML = "";
      Overlay.hide();
    };

    const init = () => {
      const toggleBtn = $("#searchToggle");
      const closeBtn = $("#searchClose");
      const input = $("#searchInput");
      if (!toggleBtn) return;
      toggleBtn.addEventListener("click", open);
      if (closeBtn) closeBtn.addEventListener("click", close);
      if (input) input.addEventListener("input", debounce((e) => render(e.target.value), 150));
    };

    return { init, open, close };
  })();

  /* ------------------------------------------------------------------ */
  /* Back to top                                                         */
  /* ------------------------------------------------------------------ */
  const BackToTop = (() => {
    const init = () => {
      const btn = $("#backToTop");
      if (!btn) return;
      const onScroll = () => {
        btn.hidden = window.scrollY < 480;
        btn.classList.toggle("is-visible", window.scrollY >= 480);
      };
      window.addEventListener("scroll", debounce(onScroll, 100), { passive: true });
      btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
      onScroll();
    };
    return { init };
  })();

  /* ------------------------------------------------------------------ */
  /* Newsletter (rodapé — presente em toda página)                       */
  /* ------------------------------------------------------------------ */
  const Newsletter = (() => {
    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const bindForm = (form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const value = input.value.trim();
        const feedback = form.querySelector("[data-feedback]");

        if (!isValidEmail(value)) {
          if (feedback) {
            feedback.textContent = "Digite um e-mail válido.";
            feedback.classList.add("is-error");
          }
          input.focus();
          return;
        }

        if (feedback) {
          feedback.textContent = `Inscrição confirmada para ${value}!`;
          feedback.classList.remove("is-error");
        }
        Toast.show("Inscrição na newsletter confirmada!");
        form.reset();
      });
    };

    const init = () => $$('form[data-newsletter]').forEach(bindForm);

    return { init };
  })();

  /* ------------------------------------------------------------------ */
  /* WhatsApp — monta a mensagem de checkout                             */
  /* ------------------------------------------------------------------ */
  const WhatsAppCheckout = (() => {
    const buildMessage = () => {
      const lines = Cart.getLines();
      if (!lines.length) return null;

      let msg = `Olá, ${STORE_CONFIG.storeName}! Quero finalizar este pedido:\n\n`;
      lines.forEach((line) => {
        msg += `• ${line.product.name} — Tam. ${line.size} — Qtd: ${line.qty} — ${formatBRL(
          line.product.price * line.qty
        )}\n`;
      });
      msg += `\nSubtotal: ${formatBRL(Cart.getSubtotal())}`;
      if (Cart.getSubtotal() < STORE_CONFIG.freeShippingThreshold) {
        msg += `\n(Faltam ${formatBRL(
          STORE_CONFIG.freeShippingThreshold - Cart.getSubtotal()
        )} para frete grátis)`;
      } else {
        msg += `\nFrete: Grátis`;
      }
      msg += `\n\nAguardo confirmação e forma de pagamento. Obrigado!`;
      return msg;
    };

    const send = () => {
      const message = buildMessage();
      if (!message) {
        Toast.show("Seu carrinho está vazio.");
        return;
      }
      const url = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener");
    };

    return { send, buildMessage };
  })();

  /* ------------------------------------------------------------------ */
  /* Inicialização comum a todas as páginas                              */
  /* ------------------------------------------------------------------ */
  const initCommon = () => {
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    Header.init();
    Search.init();
    Wishlist.init();
    Cart.init();
    BackToTop.init();
    Newsletter.init();
    Reveal.init();
  };

  /* ------------------------------------------------------------------ */
  /* API pública                                                         */
  /* ------------------------------------------------------------------ */
  return {
    $,
    $$,
    state,
    formatBRL,
    formatDate,
    debounce,
    discountPercent,
    seasonLabel,
    seasonIcon,
    getProductById,
    qs,
    Toast,
    Overlay,
    Cart,
    Wishlist,
    ProductCard,
    Reveal,
    Header,
    Search,
    BackToTop,
    Newsletter,
    WhatsAppCheckout,
    initCommon,
  };
})();
