/* ==========================================================================
   SHINKAI — login.js
   Autenticação SIMULADA em memória (sem localStorage, sem backend real).
   Serve para validar o fluxo de UX antes da integração com a API real.

   Quando o backend existir, troque:
   - registerUser()  → fetch('/api/auth/register', { method: 'POST', body })
   - loginUser()     → fetch('/api/auth/login',    { method: 'POST', body })
   - logoutUser()    → fetch('/api/auth/logout',   { method: 'POST' })
   mantendo os mesmos pontos de entrada/saída (mesmas funções, corpo trocado).
   ========================================================================== */

(function () {
  "use strict";

  const { $, $$, initCommon, Toast, state } = window.Shinkai;

  /** "Banco de dados" fake em memória — some ao recarregar a página. */
  const fakeUsersDB = [];

  /* ---------------------------------------------------------------- */
  /* Troca de abas (Entrar / Cadastrar)                                 */
  /* ---------------------------------------------------------------- */
  const switchTab = (tabName) => {
    $$(".auth__tab").forEach((tab) => {
      const isActive = tab.dataset.authTab === tabName;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    $$("[data-auth-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.authPanel !== tabName;
    });
  };

  const bindTabs = () => {
    $$(".auth__tab").forEach((tab) => {
      tab.addEventListener("click", () => switchTab(tab.dataset.authTab));
    });
    $$("[data-auth-switch]").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.authSwitch));
    });
  };

  /* ---------------------------------------------------------------- */
  /* Cadastro                                                            */
  /* ---------------------------------------------------------------- */
  const setFeedback = (el, message, isSuccess = false) => {
    el.textContent = message;
    el.classList.toggle("is-success", isSuccess);
  };

  const registerUser = ({ name, email, password, passwordConfirm }) => {
    const feedback = $("#registerFeedback");

    if (!name.trim() || !email.trim() || !password) {
      setFeedback(feedback, "Preencha todos os campos.");
      return false;
    }
    if (password.length < 6) {
      setFeedback(feedback, "A senha precisa ter pelo menos 6 caracteres.");
      return false;
    }
    if (password !== passwordConfirm) {
      setFeedback(feedback, "As senhas não coincidem.");
      return false;
    }
    if (fakeUsersDB.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      setFeedback(feedback, "Já existe uma conta com este e-mail.");
      return false;
    }

    fakeUsersDB.push({ name: name.trim(), email: email.trim(), password });
    setFeedback(feedback, "Conta criada! Entrando...", true);
    return true;
  };

  /* ---------------------------------------------------------------- */
  /* Login                                                               */
  /* ---------------------------------------------------------------- */
  const loginUser = ({ email, password }) => {
    const feedback = $("#loginFeedback");
    const user = fakeUsersDB.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
      setFeedback(feedback, "E-mail ou senha incorretos.");
      return false;
    }

    setFeedback(feedback, "Login realizado!", true);
    return user;
  };

  /* ---------------------------------------------------------------- */
  /* Sessão                                                              */
  /* ---------------------------------------------------------------- */
  const setLoggedInView = (user) => {
    state.currentUser = user;
    $("#authGuest").hidden = true;
    $("#authLogged").hidden = false;
    $("#loggedGreeting").textContent = `Olá, ${user.name.split(" ")[0]}!`;
    $("#loggedEmail").textContent = user.email;
  };

  const setLoggedOutView = () => {
    state.currentUser = null;
    $("#authGuest").hidden = false;
    $("#authLogged").hidden = true;
    $("#loginForm").reset();
    $("#registerForm").reset();
  };

  /* ---------------------------------------------------------------- */
  /* Eventos                                                             */
  /* ---------------------------------------------------------------- */
  const bindForms = () => {
    $("#registerForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const payload = {
        name: $("#registerName").value,
        email: $("#registerEmail").value,
        password: $("#registerPassword").value,
        passwordConfirm: $("#registerPasswordConfirm").value,
      };
      const ok = registerUser(payload);
      if (ok) {
        Toast.show(`Bem-vindo(a), ${payload.name.split(" ")[0]}!`);
        setTimeout(() => setLoggedInView({ name: payload.name, email: payload.email }), 500);
      }
    });

    $("#loginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const payload = { email: $("#loginEmail").value, password: $("#loginPassword").value };
      const user = loginUser(payload);
      if (user) {
        Toast.show(`Bem-vindo(a) de volta, ${user.name.split(" ")[0]}!`);
        setTimeout(() => setLoggedInView(user), 400);
      }
    });

    $("#logoutBtn").addEventListener("click", () => {
      setLoggedOutView();
      Toast.show("Sessão encerrada.");
    });
  };

  const setupWhatsappFloat = () => {
    const el = $("#whatsappFloat");
    if (!el) return;
    const msg = encodeURIComponent(`Olá, ${STORE_CONFIG.storeName}! Preciso de ajuda com minha conta.`);
    el.href = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${msg}`;
  };

  document.addEventListener("DOMContentLoaded", () => {
    initCommon();
    bindTabs();
    bindForms();
    setupWhatsappFloat();
  });
})();
