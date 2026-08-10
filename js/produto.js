(function () {
  "use strict";

  const { $, $$, formatBRL, discountPercent, getProductById, Cart, Wishlist, ProductCard, initCommon, qs, Toast } = window.Shinkai;

  let selectedSize = null;
  let qty = 1;
  let activeImageIndex = 0;
  let currentProduct = null;

  const renderNotFound = () => {
    $("#productSkeleton").remove();
    $("#productNotFound").hidden = false;
  };

  const renderBreadcrumb = (product) => {
    $("#productBreadcrumb").innerHTML = `
      <a href="index.html">Início</a> <span>/</span>
      <a href="catalogo.html">Catálogo</a> <span>/</span>
      <span>${product.name}</span>`;
  };

  const renderGallery = (product) => {
    const images = product.gallery && product.gallery.length ? product.gallery : [product.image];
    const pct = discountPercent(product);

    return `
      <div class="product-gallery">
        <div class="product-gallery__main">
          <div class="product-gallery__badges">
            ${product.bestSeller ? '<span class="badge-pill badge-pill--bestseller">Mais vendida</span>' : ""}
            ${product.isNew ? '<span class="badge-pill badge-pill--new">Novo</span>' : ""}
            ${pct > 0 ? `<span class="badge-pill badge-pill--discount">-${pct}%</span>` : ""}
          </div>
          <img id="mainProductImage" src="${images[0]}" alt="${product.name}" />
        </div>
        ${
          images.length > 1
            ? `<div class="product-gallery__thumbs">
                ${images
                  .map(
                    (img, i) =>
                      `<button data-thumb="${i}" class="${i === 0 ? "is-active" : ""}"><img src="${img}" alt="${product.name} — imagem ${i + 1}" /></button>`
                  )
                  .join("")}
              </div>`
            : ""
        }
      </div>`;
  };

  const renderInfo = (product) => {
    selectedSize = product.sizes[0];
    qty = 1;
    const installments = (product.price / 3).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const lowStock = product.stock > 0 && product.stock <= 10;

    return `
      <div class="product-info">
        <p class="product-info__anime">${product.anime}</p>
        <h1 class="product-info__name">${product.name}</h1>
        <div class="product-info__rating">
          <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-regular fa-star-half-stroke"></i>
          <span>(${product.sold} vendidos)</span>
        </div>
        <div class="product-info__price">
          <strong>${formatBRL(product.price)}</strong>
          ${product.oldPrice ? `<small>${formatBRL(product.oldPrice)}</small>` : ""}
          ${discountPercent(product) > 0 ? `<span class="badge-pill badge-pill--discount">-${discountPercent(product)}%</span>` : ""}
        </div>
        <p class="product-info__installments">ou 3x de ${installments} sem juros</p>
        ${
          lowStock
            ? `<p class="product-info__stock"><i class="fa-solid fa-triangle-exclamation"></i> Últimas ${product.stock} unidades em estoque</p>`
            : ""
        }

        <div class="product-info__section">
          <h3>Tamanho</h3>
          <div class="product-info__sizes" id="productSizes">
            ${product.sizes
              .map((size, i) => `<button class="size-btn ${i === 0 ? "is-selected" : ""}" data-size="${size}">${size}</button>`)
              .join("")}
          </div>
        </div>

        <div class="product-info__section">
          <h3>Quantidade</h3>
          <div class="product-info__qty" id="productQty">
            <button data-qty-step="-1" aria-label="Diminuir quantidade">−</button>
            <span id="productQtyValue">1</span>
            <button data-qty-step="1" aria-label="Aumentar quantidade">+</button>
          </div>
        </div>

        <div class="product-info__actions">
          <button class="btn btn--primary" id="addToCartBtn"><i class="fa-solid fa-cart-plus"></i> Adicionar ao carrinho</button>
          <button class="icon-btn" id="productWishlistBtn" aria-label="Adicionar aos favoritos" aria-pressed="${Wishlist.has(product.id)}">
            <i class="fa-${Wishlist.has(product.id) ? "solid" : "regular"} fa-heart"></i>
          </button>
        </div>

        <p class="product-info__description">${product.description}</p>

        <ul class="product-info__perks">
          <li><i class="fa-solid fa-truck-fast"></i> Frete grátis para compras acima de R$199</li>
          <li><i class="fa-solid fa-rotate"></i> Troca grátis em até 7 dias</li>
          <li><i class="fa-brands fa-whatsapp"></i> Dúvidas? Fale com a gente no WhatsApp</li>
        </ul>
      </div>`;
  };

  const bindGalleryEvents = (product) => {
    const images = product.gallery && product.gallery.length ? product.gallery : [product.image];
    $$(".product-gallery__thumbs button").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeImageIndex = Number(btn.dataset.thumb);
        $$(".product-gallery__thumbs button").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const mainImg = $("#mainProductImage");
        mainImg.style.opacity = 0;
        setTimeout(() => {
          mainImg.src = images[activeImageIndex];
          mainImg.style.opacity = 1;
        }, 180);
      });
    });
  };

  const bindInfoEvents = (product) => {
    $$("#productSizes .size-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$("#productSizes .size-btn").forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        selectedSize = btn.dataset.size;
      });
    });

    $$("#productQty [data-qty-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const delta = Number(btn.dataset.qtyStep);
        qty = Math.max(1, Math.min(product.stock || 99, qty + delta));
        $("#productQtyValue").textContent = String(qty);
      });
    });

    $("#addToCartBtn").addEventListener("click", () => {
      Cart.addItem(product, selectedSize, qty);
    });

    $("#productWishlistBtn").addEventListener("click", () => {
      const isNowWished = Wishlist.toggle(product);
      const btn = $("#productWishlistBtn");
      btn.querySelector("i").className = `fa-${isNowWished ? "solid" : "regular"} fa-heart`;
      btn.setAttribute("aria-pressed", String(isNowWished));
    });
  };

  const renderRelated = (product) => {
    const related = PRODUCTS.filter(
      (p) => p.id !== product.id && (p.anime === product.anime || p.category === product.category)
    ).slice(0, 4);

    if (!related.length) return;

    $("#relatedSection").hidden = false;
    $("#relatedGrid").innerHTML = related.map((p) => ProductCard.render(p)).join("");
    ProductCard.bindEvents($("#relatedGrid"));
  };

  const setupWhatsappFloat = () => {
    const el = $("#whatsappFloat");
    if (!el || !currentProduct) return;
    const msg = encodeURIComponent(`Olá! Tenho uma dúvida sobre o produto "${currentProduct.name}".`);
    el.href = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${msg}`;
  };

  const loadProduct = () => {
    const id = qs("id");
    const product = id ? getProductById(id) : null;

    if (!product) {
      renderNotFound();
      return;
    }

    currentProduct = product;
    document.getElementById("pageTitle").textContent = `${product.name} — SHINKAI`;
    renderBreadcrumb(product);

    const skeleton = $("#productSkeleton");
    const section = $("#productDetail");
    const wrapper = document.createElement("div");
    wrapper.className = "container product-detail__grid";
    wrapper.innerHTML = renderGallery(product) + renderInfo(product);
    section.replaceChild(wrapper, skeleton);

    bindGalleryEvents(product);
    bindInfoEvents(product);
    renderRelated(product);
    setupWhatsappFloat();
  };

  document.addEventListener("DOMContentLoaded", () => {
    initCommon();
    loadProduct();
  });
})();
