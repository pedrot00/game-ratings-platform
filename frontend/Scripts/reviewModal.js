import { getGameById } from "../Mocks/games.js";

// Componente independente da pagina. O Perfil reutilizara exatamente este modal.
// A persistencia fica a cargo de quem chama, via onSave(payload).
export function mountReviewModal({ onSave }) {
  const dialog = document.createElement("dialog");
  dialog.className = "review-dialog";
  dialog.setAttribute("aria-labelledby", "review-dialog-title");
  dialog.innerHTML = `
    <form class="review-form" novalidate>
      <header class="review-dialog-header">
        <div>
          <p class="review-eyebrow">GAMEAVAL.IO · COMMUNITY</p>
          <h2 id="review-dialog-title">Write a review</h2>
          <p id="review-dialog-game" class="review-dialog-game"></p>
        </div>
        <button type="button" class="review-dialog-close" aria-label="Close review editor">×</button>
      </header>
      <p class="review-demo-note">Demo mode: no account is authenticated. Your review is saved only in this browser.</p>
      <fieldset class="review-rating-field">
        <legend>Your rating <span aria-hidden="true">*</span></legend>
        <div class="review-star-options" role="group" aria-label="Choose a rating">
          ${[1, 2, 3, 4, 5].map(value => `
            <span class="review-star-option">
              <input type="radio" name="rating" id="review-star-${value}" value="${value}" required>
              <label for="review-star-${value}" title="${value} ${value === 1 ? "star" : "stars"}">★<span class="visually-hidden">${value} ${value === 1 ? "star" : "stars"}</span></label>
            </span>`).join("")}
        </div>
        <p id="review-rating-description" class="review-field-hint" aria-live="polite">Select 1 to 5 stars.</p>
      </fieldset>
      <div class="review-field">
        <label for="review-form-title">Review headline <span aria-hidden="true">*</span></label>
        <input id="review-form-title" name="title" type="text" placeholder="Give your experience a title" minlength="3" maxlength="90" required>
      </div>
      <div class="review-field">
        <label for="review-form-body">Your review <span aria-hidden="true">*</span></label>
        <textarea id="review-form-body" name="body" rows="6" placeholder="What stood out to you?" minlength="20" maxlength="2500" required></textarea>
        <p class="review-field-hint">20 to 2,500 characters.</p>
      </div>
      <p id="review-form-error" class="review-form-error" role="alert" hidden></p>
      <footer class="review-dialog-actions">
        <button class="review-button-secondary" type="button" data-cancel>Cancel</button>
        <button class="review-button-primary" type="submit">Save review</button>
      </footer>
    </form>`;
  document.body.append(dialog);

  const form = dialog.querySelector("form");
  const title = form.elements.namedItem("title");
  const body = form.elements.namedItem("body");
  const inputs = [...form.querySelectorAll('[name="rating"]')];
  const ratingHint = dialog.querySelector("#review-rating-description");
  const error = dialog.querySelector("#review-form-error");
  const submit = form.querySelector('[type="submit"]');
  let gameId = null;
  let lastFocus = null;

  function paintStars() {
    const selected = Number(inputs.find(input => input.checked)?.value || 0);
    inputs.forEach(input => {
      input.parentElement.classList.toggle("is-filled", selected > 0 && Number(input.value) <= selected);
    });
    ratingHint.textContent = selected ? `${selected} out of 5 stars selected.` : "Select 1 to 5 stars.";
  }

  inputs.forEach(input => input.addEventListener("change", paintStars));
  const close = () => dialog.close();
  dialog.querySelector(".review-dialog-close").addEventListener("click", close);
  dialog.querySelector("[data-cancel]").addEventListener("click", close);
  dialog.addEventListener("close", () => lastFocus?.focus?.());
  dialog.addEventListener("click", event => {
    // Clicar na camada de fundo fecha, clicar dentro do formulario nao.
    if (event.target === dialog) close();
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    error.hidden = true;
    const rating = Number(inputs.find(input => input.checked)?.value || 0);
    if (!rating) {
      error.textContent = "Choose a star rating before saving.";
      error.hidden = false;
      inputs[0].focus();
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    submit.disabled = true;
    try {
      await onSave({ gameId, rating, title: title.value.trim(), body: body.value.trim() });
      close();
    } catch (cause) {
      error.textContent = cause?.message || "Unable to save the review.";
      error.hidden = false;
    } finally {
      submit.disabled = false;
    }
  });

  return {
    open({ gameId: nextGameId, review = null }) {
      const game = getGameById(nextGameId);
      if (!game) return false;
      lastFocus = document.activeElement;
      gameId = nextGameId;
      form.reset();
      error.hidden = true;
      dialog.querySelector("#review-dialog-title").textContent = review ? "Edit your review" : "Write a review";
      dialog.querySelector("#review-dialog-game").textContent = game.title;
      title.value = review?.title ?? "";
      body.value = review?.body ?? "";
      inputs.forEach(input => { input.checked = Number(input.value) === review?.rating; });
      paintStars();
      dialog.showModal();
      title.focus();
      return true;
    },
    close
  };
}
