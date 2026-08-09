/* ==========================================================================
   SHINKAI — carrinho.js
   Página completa do carrinho: lista editável, resumo com barra de frete
   grátis e checkout que monta a mensagem e abre o WhatsApp.
   ========================================================================== */

(function () {
  "use strict";

  const { $, formatBRL, Cart, initCommon, Toast, WhatsAppCheckout } = window.Shinkai;

  const renderList = () => {
    const listEl = $("#cartPageList");
    const emptyEl = $("#cartPageEmpty");
    const summaryEl = $("#cartPageSummary");
    const lines = Cart.getLines();

    const isEmpty = lines.length === 0;
    emptyEl.hidden = !isEmpty;
    listEl.hidden = isEmpty;
    summaryEl.hidden = isEmpty;

    listEl.innerHTML = lines
      .map(
        (line) => `
        <div class="cart-line" data-product-id="${line.product.id}" data-size="${line.size}">
          <img src="${line.product.image}" alt="${line.product.name}" />
          <div>
            <p class="cart-line__anime">${line.product.anime}</p>
            <p class="cart-line__name">${line.product.name}</p>
            <p class="cart-line__meta">Tamanho: ${line.size}</p>
            <div class="cart-line__controls">
              <div class="cart-line__qty">
                <button data-qty="-1" aria-label="Diminuir quantidade">−</button>
                <span>${line.qty}</span>
                <button data-qty="1" aria-label="Aumentar quantidade">+</button>
              </div>
            </div>
          </div>
          <div class="cart-line__price-col">
            <span class="cart-line__price">${formatBRL(line.product.price * line.qty)}</span>
            <button class="cart-line__remove" data-remove aria-label="Remover item"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>`
      )
      .join("");

    renderSummary();
  };

  const renderSummary = () => {
    const subtotal = Cart.getSubtotal();
    const threshold = STORE_CONFIG.freeShippingThreshold;
    const isFreeShipping = subtotal >= threshold;

    $("#summarySubtotal").textContent = formatBRL(subtotal);
    $("#summaryShipping").textContent = isFreeShipping || subtotal === 0 ? "Grátis" : "Calculado no WhatsApp";
    $("#summaryTotal").textContent = formatBRL(subtotal);

    const progressPct = Math.min(100, (subtotal / threshold) * 100);
    $("#shippingFill").style.width = `${progressPct}%`;

    const messageEl = $("#shippingMessage");
    if (isFreeShipping) {
      messageEl.innerHTML = '<i class="fa-solid fa-check" style="color:var(--success)"></i> Você garantiu frete grátis!';
    } else {
      const missing = threshold - subtotal;
      messageEl.textContent = `Faltam ${formatBRL(missing)} para o frete grátis.`;
    }
  };

  const bindListEvents = () => {
    $("#cartPageList").addEventListener("click", (e) => {
      const line = e.target.closest(".cart-line");
      if (!line) return;
      const { productId, size } = line.dataset;

      const qtyBtn = e.target.closest("[data-qty]");
      if (qtyBtn) {
        Cart.updateQty(productId, size, Number(qtyBtn.dataset.qty));
        return;
      }
      if (e.target.closest("[data-remove]")) {
        Cart.removeItem(productId, size);
      }
    });
  };

  /* ---- Validação simples do formulário ---- */
  const setFieldError = (input, message) => {
    const field = input.closest(".field");
    field.classList.toggle("has-error", Boolean(message));
    let errorEl = field.querySelector(".field__error");
    if (!errorEl) {
      errorEl = document.createElement("p");
      errorEl.className = "field__error";
      field.appendChild(errorEl);
    }
    errorEl.textContent = message || "";
  };

  const validateForm = () => {
    let valid = true;
    const name = $("#checkoutName");
    const phone = $("#checkoutPhone");

    if (!name.value.trim()) {
      setFieldError(name, "Informe seu nome completo.");
      valid = false;
    } else {
      setFieldError(name, "");
    }

    const phoneDigits = phone.value.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setFieldError(phone, "Informe um WhatsApp válido com DDD.");
      valid = false;
    } else {
      setFieldError(phone, "");
    }

    return valid;
  };

  /* ---- Monta a mensagem final com dados do cliente + pedido ---- */
  const buildFullMessage = () => {
    const lines = Cart.getLines();
    const name = $("#checkoutName").value.trim();
    const phone = $("#checkoutPhone").value.trim();
    const address = $("#checkoutAddress").value.trim();
    const payment = $("#checkoutPayment").value;

    let msg = `Olá, ${STORE_CONFIG.storeName}! Meu nome é ${name} e quero finalizar este pedido:\n\n`;
    lines.forEach((line) => {
      msg += `• ${line.product.name} — Tam. ${line.size} — Qtd: ${line.qty} — ${formatBRL(line.product.price * line.qty)}\n`;
    });

    const subtotal = Cart.getSubtotal();
    msg += `\nSubtotal: ${formatBRL(subtotal)}`;
    msg += subtotal >= STORE_CONFIG.freeShippingThreshold
      ? `\nFrete: Grátis`
      : `\nFrete: a combinar (faltam ${formatBRL(STORE_CONFIG.freeShippingThreshold - subtotal)} para frete grátis)`;

    msg += `\n\nMeu WhatsApp: ${phone}`;
    if (address) msg += `\nEndereço de entrega: ${address}`;
    msg += `\nForma de pagamento preferida: ${payment}`;
    msg += `\n\nAguardo a confirmação. Obrigado!`;

    return msg;
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();

    if (!Cart.getLines().length) {
      Toast.show("Seu carrinho está vazio.");
      return;
    }
    if (!validateForm()) return;

    const message = buildFullMessage();
    const url = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
    Toast.show("Pedido pronto! Continue no WhatsApp para confirmar.");
  };

  document.addEventListener("shinkai:cart-changed", renderList);

  document.addEventListener("DOMContentLoaded", () => {
    initCommon();
    bindListEvents();
    renderList();
    $("#checkoutForm").addEventListener("submit", handleCheckoutSubmit);
  });
})();
