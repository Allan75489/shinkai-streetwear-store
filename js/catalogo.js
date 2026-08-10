(function () {
  "use strict";

  const { $, $$, formatBRL, discountPercent, seasonLabel, ProductCard, Wishlist, initCommon, qs } = window.Shinkai;

  const PRICE_RANGES = [
    { id: "ate-79", label: "Até R$ 79,90", test: (p) => p.price <= 79.9 },
    { id: "80-99", label: "R$ 80 a R$ 99,90", test: (p) => p.price > 79.9 && p.price <= 99.9 },
    { id: "100-149", label: "R$ 100 a R$ 149,90", test: (p) => p.price > 99.9 && p.price <= 149.9 },
    { id: "acima-150", label: "Acima de R$ 150", test: (p) => p.price > 149.9 },
  ];

  const filterState = {
    categories: new Set(),
    seasons: new Set(),
    priceRanges: new Set(),
    dealsOnly: false,
    search: "",
    favoritesOnly: false,
    sort: "relevancia",
  };

  /* ---------------------------------------------------------------- */
  /* Render de opções de filtro (categoria / estação)                  */
  /* ---------------------------------------------------------------- */
  const renderFilterOptions = () => {
    const catEl = $("#categoryFilters");
    catEl.innerHTML = CATEGORIES.map(
      (cat) => `<button data-filter-type="category" data-value="${cat}" class="${filterState.categories.has(cat) ? "is-active" : ""}">${cat}</button>`
    ).join("");

    const seasonEl = $("#seasonFilters");
    seasonEl.innerHTML = SEASONS.map(
      (s) => `<button data-filter-type="season" data-value="${s.id}" class="${filterState.seasons.has(s.id) ? "is-active" : ""}"><i class="fa-solid ${s.icon}"></i> ${s.label}</button>`
    ).join("");

    const priceEl = $("#priceFilters");
    priceEl.innerHTML = PRICE_RANGES.map(
      (r) => `<button data-filter-type="price" data-value="${r.id}" class="${filterState.priceRanges.has(r.id) ? "is-active" : ""}">${r.label}</button>`
    ).join("");
  };

  /* ---------------------------------------------------------------- */
  /* Aplicar filtros + ordenação                                       */
  /* ---------------------------------------------------------------- */
  const getFilteredProducts = () => {
    let items = [...PRODUCTS];

    if (filterState.favoritesOnly) {
      items = items.filter((p) => Wishlist.has(p.id));
    }

    if (filterState.categories.size) {
      items = items.filter((p) => filterState.categories.has(p.category));
    }

    if (filterState.seasons.size) {
      items = items.filter((p) => filterState.seasons.has(p.season));
    }

    if (filterState.priceRanges.size) {
      items = items.filter((p) => {
        const ranges = PRICE_RANGES.filter((r) => filterState.priceRanges.has(r.id));
        return ranges.some((r) => r.test(p));
      });
    }

    if (filterState.dealsOnly) {
      items = items.filter((p) => p.oldPrice);
    }

    if (filterState.search.trim()) {
      const q = filterState.search.trim().toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(q) || p.anime.toLowerCase().includes(q));
    }

    switch (filterState.sort) {
      case "mais-vendidos":
        items.sort((a, b) => b.sold - a.sold);
        break;
      case "menor-preco":
        items.sort((a, b) => a.price - b.price);
        break;
      case "maior-preco":
        items.sort((a, b) => b.price - a.price);
        break;
      case "desconto":
        items.sort((a, b) => discountPercent(b) - discountPercent(a));
        break;
      default:
        items.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
    }

    return items;
  };

  /* ---------------------------------------------------------------- */
  /* Chips de filtro ativo                                             */
  /* ---------------------------------------------------------------- */
  const renderActiveChips = () => {
    const chipsEl = $("#activeChips");
    const chips = [];

    filterState.categories.forEach((c) => chips.push({ label: c, type: "category", value: c }));
    filterState.seasons.forEach((s) => chips.push({ label: seasonLabel(s), type: "season", value: s }));
    filterState.priceRanges.forEach((id) => {
      const range = PRICE_RANGES.find((r) => r.id === id);
      chips.push({ label: range.label, type: "price", value: id });
    });
    if (filterState.dealsOnly) chips.push({ label: "Com desconto", type: "deals", value: "deals" });
    if (filterState.favoritesOnly) chips.push({ label: "Favoritos", type: "favorites", value: "favorites" });
    if (filterState.search.trim()) chips.push({ label: `"${filterState.search.trim()}"`, type: "search", value: "search" });

    chipsEl.innerHTML = chips
      .map(
        (chip) => `
        <span class="active-chip" data-chip-type="${chip.type}" data-chip-value="${chip.value}">
          ${chip.label} <button aria-label="Remover filtro ${chip.label}"><i class="fa-solid fa-xmark"></i></button>
        </span>`
      )
      .join("");
  };

  const removeChip = (type, value) => {
    if (type === "category") filterState.categories.delete(value);
    if (type === "season") filterState.seasons.delete(value);
    if (type === "price") filterState.priceRanges.delete(value);
    if (type === "deals") filterState.dealsOnly = false;
    if (type === "favorites") {
      filterState.favoritesOnly = false;
      updateHeaderTitle();
    }
    if (type === "search") {
      filterState.search = "";
      $("#catalogSearch").value = "";
    }
    render();
  };

  /* ---------------------------------------------------------------- */
  /* Título dinâmico (quando vindo de "favoritos" ou estação via URL)   */
  /* ---------------------------------------------------------------- */
  const updateHeaderTitle = () => {
    const titleEl = $("#catalogTitle");
    const subtitleEl = $("#catalogSubtitle");
    const breadcrumbEl = $("#breadcrumbCurrent");

    if (filterState.favoritesOnly) {
      titleEl.textContent = "Meus favoritos";
      subtitleEl.textContent = "Todas as peças que você curtiu, reunidas em um só lugar.";
      breadcrumbEl.textContent = "Favoritos";
    } else if (filterState.seasons.size === 1) {
      const seasonId = [...filterState.seasons][0];
      const label = seasonLabel(seasonId);
      titleEl.textContent = `Coleção ${label}`;
      subtitleEl.textContent = `As melhores peças SHINKAI para curtir o ${label.toLowerCase()}.`;
      breadcrumbEl.textContent = label;
    } else {
      titleEl.textContent = "Catálogo completo";
      subtitleEl.textContent = "Todas as peças SHINKAI em um só lugar. Filtre por estação, categoria ou faixa de preço.";
      breadcrumbEl.textContent = "Catálogo";
    }
  };

  /* ---------------------------------------------------------------- */
  /* Render principal                                                   */
  /* ---------------------------------------------------------------- */
  const render = () => {
    renderFilterOptions();
    renderActiveChips();

    const grid = $("#catalogGrid");
    const emptyState = $("#catalogEmptyState");
    const countEl = $("#resultsCount");

    const items = getFilteredProducts();
    countEl.textContent = `${items.length} produto${items.length === 1 ? "" : "s"}`;

    if (!items.length) {
      grid.innerHTML = "";
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
      grid.innerHTML = items.map((p) => ProductCard.render(p)).join("");
      ProductCard.bindEvents(grid);
    }
    window.Shinkai.Reveal.observeAll();
  };

  /* ---------------------------------------------------------------- */
  /* Eventos                                                            */
  /* ---------------------------------------------------------------- */
  const bindFilterClicks = () => {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter-type]");
      if (btn) {
        const { filterType, value } = btn.dataset;
        const map = { category: filterState.categories, season: filterState.seasons, price: filterState.priceRanges };
        const set = map[filterType];
        if (set.has(value)) set.delete(value);
        else set.add(value);
        render();
        return;
      }

      const chipBtn = e.target.closest(".active-chip button");
      if (chipBtn) {
        const chip = chipBtn.closest(".active-chip");
        removeChip(chip.dataset.chipType, chip.dataset.chipValue);
      }
    });
  };

  const bindToolbar = () => {
    $("#sortSelect").addEventListener("change", (e) => {
      filterState.sort = e.target.value;
      render();
    });

    $("#catalogSearch").addEventListener(
      "input",
      window.Shinkai.debounce((e) => {
        filterState.search = e.target.value;
        render();
      }, 200)
    );

    $("#dealsOnlyFilter").addEventListener("change", (e) => {
      filterState.dealsOnly = e.target.checked;
      render();
    });

    const clearFilters = () => {
      filterState.categories.clear();
      filterState.seasons.clear();
      filterState.priceRanges.clear();
      filterState.dealsOnly = false;
      filterState.favoritesOnly = false;
      filterState.search = "";
      $("#catalogSearch").value = "";
      $("#dealsOnlyFilter").checked = false;
      $("#sortSelect").value = "relevancia";
      filterState.sort = "relevancia";
      updateHeaderTitle();
      render();
    };

    $("#clearFiltersBtn").addEventListener("click", clearFilters);
    $("#emptyStateClear").addEventListener("click", clearFilters);
  };

  /* ---------------------------------------------------------------- */
  /* Leitura de parâmetros da URL (?season=, ?view=favoritos, ?sort=)   */
  /* ---------------------------------------------------------------- */
  const applyUrlParams = () => {
    const season = qs("season");
    const view = qs("view");
    const sort = qs("sort");

    if (season && SEASONS.some((s) => s.id === season)) filterState.seasons.add(season);
    if (view === "favoritos") filterState.favoritesOnly = true;
    if (sort === "desconto") {
      filterState.sort = "desconto";
      $("#sortSelect").value = "desconto";
    }
    updateHeaderTitle();
  };

  const setupWhatsappFloat = () => {
    const el = $("#whatsappFloat");
    if (!el) return;
    const msg = encodeURIComponent(`Olá, ${STORE_CONFIG.storeName}! Gostaria de saber mais sobre os produtos.`);
    el.href = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${msg}`;
  };

  document.addEventListener("DOMContentLoaded", () => {
    initCommon();
    applyUrlParams();
    bindFilterClicks();
    bindToolbar();
    setupWhatsappFloat();
    render();
  });
})();
