/* ==========================================================================
   SHINKAI — contato.js
   Formulário de contato (modo demonstração — pronto pra plugar backend) +
   link dinâmico do canal WhatsApp.
   ========================================================================== */

(function () {
  "use strict";

  const { $, initCommon, Toast } = window.Shinkai;

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const setupChannels = () => {
    const msg = encodeURIComponent(`Olá, ${STORE_CONFIG.storeName}! Preciso de ajuda com um pedido.`);
    const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${msg}`;
    $("#whatsappChannel").href = whatsappUrl;

    const floatEl = $("#whatsappFloat");
    if (floatEl) floatEl.href = whatsappUrl;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = $("#contactName");
    const email = $("#contactEmail");
    const message = $("#contactMessage");
    const feedback = $("#contactFeedback");

    if (!name.value.trim() || !isValidEmail(email.value) || !message.value.trim()) {
      feedback.textContent = "Preencha nome, e-mail válido e mensagem antes de enviar.";
      feedback.classList.add("is-error");
      return;
    }

    // TODO(backend): substituir por fetch('/api/contato', { method: 'POST', body: ... })
    feedback.textContent = "Mensagem registrada! (modo demonstração — em breve integrado ao backend)";
    feedback.classList.remove("is-error");
    Toast.show("Mensagem enviada com sucesso!");
    e.target.reset();
  };

  document.addEventListener("DOMContentLoaded", () => {
    initCommon();
    setupChannels();
    $("#contactForm").addEventListener("submit", handleSubmit);
  });
})();
