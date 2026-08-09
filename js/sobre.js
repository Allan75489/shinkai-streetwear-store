/* ==========================================================================
   SHINKAI — sobre.js
   Contadores animados de estatísticas + inicialização comum.
   ========================================================================== */

(function () {
  "use strict";

  const { $, initCommon } = window.Shinkai;

  const animateCount = (el, target, duration = 1200) => {
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString("pt-BR");
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const setupStats = () => {
    const productsEl = $("#statProducts");
    const soldEl = $("#statSold");
    if (!productsEl || !soldEl) return;

    const totalProducts = PRODUCTS.length;
    const totalSold = PRODUCTS.reduce((sum, p) => sum + p.sold, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(productsEl, totalProducts);
            animateCount(soldEl, totalSold);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe($(".stats"));
  };

  const setupWhatsappFloat = () => {
    const el = $("#whatsappFloat");
    if (!el) return;
    const msg = encodeURIComponent(`Olá, ${STORE_CONFIG.storeName}! Gostaria de saber mais sobre a marca.`);
    el.href = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${msg}`;
  };

  document.addEventListener("DOMContentLoaded", () => {
    initCommon();
    setupStats();
    setupWhatsappFloat();
  });
})();
