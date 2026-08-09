/* ==========================================================================
   SHINKAI — home.js
   Lógica exclusiva da Home: slider do hero, mais vendidas, estações,
   melhores preços e teaser do blog. Depende de data.js + core.js.
   ========================================================================== */

(function () {
  "use strict";

  const { $, $$, formatBRL, formatDate, ProductCard, initCommon, Toast } = window.Shinkai;

  /* ---- Slider do Hero ---- */
  const HeroSlider = (() => {
    const slides = $$("#heroSlides .hero__slide");
    const dotsEl = $("#heroDots");
    let current = 0;
    let timer = null;
    const INTERVAL = 5000;

    const renderDots = () => {
      dotsEl.innerHTML = slides
        .map((_, i) => `<button role="tab" aria-label="Ver destaque ${i + 1}" class="${i === 0 ? "is-active" : ""}" data-slide="${i}"></button>`)
        .join("");
    };

    const goTo = (index) => {
      slides[current].classList.remove("is-active");
      $$("button", dotsEl)[current].classList.remove("is-active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      $$("button", dotsEl)[current].classList.add("is-active");
    };

    const start = () => {
      stop();
      timer = setInterval(() => goTo(current + 1), INTERVAL);
    };

    const stop = () => timer && clearInterval(timer);

    const init = () => {
      if (!slides.length || slides.length <= 1) return;
      renderDots();
      dotsEl.addEventListener("click", (e) => {
        const dot = e.target.closest("[data-slide]");
        if (!dot) return;
        goTo(Number(dot.dataset.slide));
        start();
      });
      const media = $(".hero__media");
      media.addEventListener("mouseenter", stop);
      media.addEventListener("mouseleave", start);
      start();
    };

    return { init };
  })();

  /* ---- Mais vendidas ---- */
  const renderBestsellers = () => {
    const grid = $("#bestsellerGrid");
    if (!grid) return;
    const items = PRODUCTS.filter((p) => p.bestSeller).slice(0, 8);
    grid.innerHTML = items.map((p) => ProductCard.render(p)).join("");
    ProductCard.bindEvents(grid);
  };

  /* ---- Melhores preços (maior desconto primeiro) ---- */
  const renderDeals = () => {
    const grid = $("#dealsGrid");
    if (!grid) return;
    const items = PRODUCTS.filter((p) => p.oldPrice)
      .sort((a, b) => (1 - a.price / a.oldPrice) < (1 - b.price / b.oldPrice) ? 1 : -1)
      .slice(0, 4);
    grid.innerHTML = items.map((p) => ProductCard.render(p)).join("");
    ProductCard.bindEvents(grid);
  };

  /* ---- Cards de estação ---- */
  const renderSeasons = () => {
    const grid = $("#seasonsGrid");
    if (!grid) return;
    const colors = {
      verao: "var(--season-verao)",
      outono: "var(--season-outono)",
      inverno: "var(--season-inverno)",
      primavera: "var(--season-primavera)",
    };
    grid.innerHTML = SEASONS.map((season) => {
      const count = PRODUCTS.filter((p) => p.season === season.id).length;
      return `
        <a class="season-card" href="catalogo.html?season=${season.id}" style="--season-color:${colors[season.id]}">
          <i class="fa-solid ${season.icon}"></i>
          <h3>${season.label}</h3>
          <span>${count} peças disponíveis</span>
        </a>`;
    }).join("");
  };

  /* ---- Teaser do blog ---- */
  const renderBlogTeaser = () => {
    const grid = $("#blogTeaserGrid");
    if (!grid) return;
    const posts = [...BLOG_POSTS].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    grid.innerHTML = posts
      .map(
        (post) => `
        <a class="blog-card" href="blog.html#${post.id}" data-reveal>
          <div class="blog-card__media"><img src="${post.image}" alt="${post.title}" loading="lazy" /></div>
          <div class="blog-card__body">
            <span class="blog-card__category">${post.category}</span>
            <h3>${post.title}</h3>
            <p class="blog-card__meta"><i class="fa-regular fa-clock"></i> ${post.readTime} de leitura · ${formatDate(post.date)}</p>
          </div>
        </a>`
      )
      .join("");
    window.Shinkai.Reveal.observeAll();
  };

  /* ---- Link do WhatsApp flutuante ---- */
  const setupWhatsappFloat = () => {
    const el = $("#whatsappFloat");
    if (!el) return;
    const msg = encodeURIComponent(`Olá, ${STORE_CONFIG.storeName}! Gostaria de saber mais sobre os produtos.`);
    el.href = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${msg}`;
  };

  document.addEventListener("DOMContentLoaded", () => {
    initCommon();
    HeroSlider.init();
    renderBestsellers();
    renderDeals();
    renderSeasons();
    renderBlogTeaser();
    setupWhatsappFloat();
  });
})();
