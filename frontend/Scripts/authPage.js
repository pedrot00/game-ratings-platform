// Login and registration screens only. No account data or passwords are persisted in the browser.
document.addEventListener("DOMContentLoaded", () => {
  const views = {
    login: document.getElementById("auth-login-view"),
    register: document.getElementById("auth-register-view")
  };
  const modeLinks = document.querySelectorAll("[data-auth-mode], [data-auth-nav]");
  const passwordFields = document.querySelectorAll("[data-password-toggle]");
  const registerPassword = document.getElementById("register-password");
  const registerConfirmation = document.getElementById("register-confirm-password");

  function getMode() {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") === "register" ? "register" : "login";
  }

  function showMode(mode) {
    for (const [name, view] of Object.entries(views)) {
      view.hidden = name !== mode;
    }
    for (const link of modeLinks) {
      const linkMode = link.dataset.authMode || link.dataset.authNav;
      const active = linkMode === mode;
      link.classList.toggle("is-active", active);
      if (link.hasAttribute("data-auth-mode")) {
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      }
    }
    document.title = `${mode === "register" ? "Create Account" : "Log In"} — GameAval.io`;
  }

  document.addEventListener("click", event => {
    const link = event.target.closest("a[data-auth-mode], a[data-auth-nav]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const mode = link.dataset.authMode || link.dataset.authNav;
    if (mode !== getMode()) {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", mode);
      history.pushState(null, "", url);
    }
    showMode(mode);
    views[mode].querySelector("h2").setAttribute("tabindex", "-1");
    views[mode].querySelector("h2").focus({ preventScroll: true });
  });

  window.addEventListener("popstate", () => showMode(getMode()));

  passwordFields.forEach(button => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.textContent = show ? "Hide" : "Show";
      button.setAttribute("aria-label", `${show ? "Hide" : "Show"} password`);
      button.setAttribute("aria-pressed", String(show));
    });
  });

  // Custom validation for password confirmation. Native constraints handle other fields.
  function validateConfirmation() {
    const matches = registerConfirmation.value === registerPassword.value;
    registerConfirmation.setCustomValidity(matches ? "" : "Passwords do not match.");
  }
  registerPassword.addEventListener("input", validateConfirmation);
  registerConfirmation.addEventListener("input", validateConfirmation);

  // Frontend prototype: do not imitate successful authentication or save credentials.
  function attachDemoSubmit(formId, feedbackId) {
    const form = document.getElementById(formId);
    const feedback = document.getElementById(feedbackId);
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (formId === "register-form") validateConfirmation();
      if (!form.reportValidity()) return;
      feedback.textContent = "Form validated. Account authentication and persistence will be available when the API is connected.";
    });
  }

  attachDemoSubmit("login-form", "login-feedback");
  attachDemoSubmit("register-form", "register-feedback");
  showMode(getMode());
});
