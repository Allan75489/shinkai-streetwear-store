/* ==========================================================================
   SHINKAI — blog.js
   Listagem de posts, filtro por categoria e modal de leitura completa.
   ========================================================================== */

(function () {
  "use strict";

  const { $, $$, formatDate, initCommon, Overlay } = window.Shinkai;

  let activeCategory = "Todos";

  const getCategories = () => ["Todos", ...new Set(BLOG_POSTS.map((p) => p.category))];

  const renderFilters = () => {
    $("#blogCategoryFilters").innerHTML = getCategories()
      .map((cat) => `<button class="filter-chip ${cat === activeCategory ? "is-active" : ""}" data-blog-filter="${cat}">${cat}</button>`)
      .join("");
  };

  const renderGrid = () => {
    const posts = [...BLOG_POSTS]
      .filter((p) => activeCategory === "Todos" || p.category === activeCategory)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    $("#blogGrid").innerHTML = posts
      .map(
        (post) => `
        <article class="blog-card" data-post-id="${post.id}" data-reveal tabindex="0" role="button" aria-label="Ler artigo: ${post.title}">
          <div class="blog-card__media"><img src="${post.image}" alt="${post.title}" loading="lazy" /></div>
          <div class="blog-card__body">
            <span class="blog-card__category">${post.category}</span>
            <h3>${post.title}</h3>
            <p class="blog-card__meta"><i class="fa-regular fa-clock"></i> ${post.readTime} de leitura · ${formatDate(post.date)}</p>
          </div>
        </article>`
      )
      .join("");

    window.Shinkai.Reveal.observeAll();
  };

  const openPost = (postId) => {
    const post = BLOG_POSTS.find((p) => p.id === postId);
    if (!post) return;

    $("#postModalImage").src = post.image;
    $("#postModalImage").alt = post.title;
    $("#postModalCategory").textContent = post.category;
    $("#postModalTitle").textContent = post.title;
    $("#postModalMeta").innerHTML = `<i class="fa-regular fa-clock"></i> ${post.readTime} de leitura · ${formatDate(post.date)}`;
    $("#postModalContent").innerHTML = post.content.map((p) => `<p>${p}</p>`).join("");

    const modal = $("#postModal");
    modal.hidden = false;
    Overlay.show(closePost);
    history.replaceState(null, "", `#${post.id}`);
  };

  const closePost = () => {
    $("#postModal").hidden = true;
    Overlay.hide();
    history.replaceState(null, "", window.location.pathname);
  };

  const bindEvents = () => {
    $("#blogCategoryFilters").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-blog-filter]");
      if (!btn) return;
      activeCategory = btn.dataset.blogFilter;
      renderFilters();
      renderGrid();
    });

    $("#blogGrid").addEventListener("click", (e) => {
      const card = e.target.closest(".blog-card");
      if (card) openPost(card.dataset.postId);
    });

    $("#blogGrid").addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest(".blog-card");
      if (card) {
        e.preventDefault();
        openPost(card.dataset.postId);
      }
    });

    $("#postModalClose").addEventListener("click", closePost);
  };

  const openFromHash = () => {
    const hash = window.location.hash.replace("#", "");
    if (hash && BLOG_POSTS.some((p) => p.id === hash)) openPost(hash);
  };

  const setupWhatsappFloat = () => {
    const el = $("#whatsappFloat");
    if (!el) return;
    const msg = encodeURIComponent(`Olá, ${STORE_CONFIG.storeName}! Vim pelo blog e quero saber mais.`);
    el.href = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${msg}`;
  };

  document.addEventListener("DOMContentLoaded", () => {
    initCommon();
    renderFilters();
    renderGrid();
    bindEvents();
    openFromHash();
    setupWhatsappFloat();
  });
})();
