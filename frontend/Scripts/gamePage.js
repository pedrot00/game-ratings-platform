import { getGameById } from "../Mocks/games.js";
import { DEMO_USER_ID } from "../Mocks/users.js";
import { getReviewForUser, getReviewsByGame, saveDemoReview } from "./reviewStore.js";
import { createReviewCard } from "./reviewCards.js";
import { mountReviewModal } from "./reviewModal.js";

document.addEventListener("DOMContentLoaded", () => {
  const gameId = new URLSearchParams(window.location.search).get("game");
  const game = getGameById(gameId);

  if (!game) {
    document.querySelector(".game-content").hidden = true;
    document.getElementById("game-hero").hidden = true;
    document.getElementById("game-reviews").hidden = true;
    document.getElementById("game-not-found").hidden = false;
    document.title = "Game not found — GameAval.io";
    return;
  }

  const setText = (id, value) => {
    document.getElementById(id).textContent = value;
  };

  setText("game-title", game.title);
  setText("game-desc", game.description || "Description coming soon.");
  setText("game-dev", game.developer || "Developer unavailable");
  setText("game-rating", `${game.ratingAverage.toFixed(1)}/5${game.ratingCount !== null ? ` (${game.ratingCount.toLocaleString("en-US")} Reviews)` : ""}`);
  setText("game-date", game.releaseDate
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${game.releaseDate}T00:00:00Z`))
    : "Release date unavailable");

  const cover = document.getElementById("game-cover-img");
  cover.src = game.images.coverUrl;
  cover.alt = `Cover art for ${game.title}`;
  cover.addEventListener("error", () => {
    document.getElementById("game-cover-figure").classList.add("has-no-image");
  });

  const hero = document.getElementById("game-hero");
  const backgroundUrl = game.images.backgroundUrl || game.images.coverUrl;
  hero.style.backgroundImage = `linear-gradient(180deg, rgba(9, 12, 18, 0.4) 0%, var(--color-bg) 100%), url("${backgroundUrl}")`;

  const tags = document.getElementById("game-tags");
  const labels = [...new Set([...game.genres, ...game.themes])];
  tags.replaceChildren(...labels.map((label, index) => {
    const span = document.createElement("span");
    span.className = index === 0 ? "filter is-active" : "filter";
    span.textContent = label;
    return span;
  }));

  const purchase = document.getElementById("game-purchase");
  if (game.price) {
    setText("game-price", new Intl.NumberFormat("en-US", { style: "currency", currency: game.price.currency }).format(game.price.amount));
    purchase.hidden = false;
  }

  // Registro de jogos: carregado sob demanda para nunca derrubar a pagina.
  import("./gameLogControls.js")
    .then(({ mountGameLog }) => mountGameLog({
      gameId: game.id,
      userId: DEMO_USER_ID,
      container: document.getElementById("game-log-options"),
      hint: document.getElementById("game-log-hint")
    }))
    .catch(error => {
      document.getElementById("game-log-hint").textContent = "Game log is unavailable right now.";
      console.error("Game log failed to load:", error);
    });

  // O formulario de reviews e independente da origem: Perfil e Detalhes
  // vao reutilizar o mesmo modal e a mesma estrutura de dados.
  const list = document.getElementById("reviews-list");
  const count = document.getElementById("reviews-count");
  const empty = document.getElementById("reviews-empty");
  const button = document.getElementById("review-create");
  const feedback = document.getElementById("review-feedback");

  function renderReviews() {
    const items = getReviewsByGame(game.id);
    list.replaceChildren(...items.map(review => createReviewCard(review, { currentUserId: DEMO_USER_ID })));
    count.textContent = `${items.length} community review${items.length === 1 ? "" : "s"}`;
    empty.hidden = items.length !== 0;
    button.textContent = getReviewForUser(game.id, DEMO_USER_ID)
      ? "Edit your review" : "Write a review";
  }

  const modal = mountReviewModal({
    onSave: ({ gameId, rating, title, body }) => {
      const result = saveDemoReview({ gameId, userId: DEMO_USER_ID, rating, title, body });
      renderReviews();
      feedback.textContent = result.persisted
        ? "Your demo review was saved in this browser. It has not been sent to a server."
        : "Your demo review is visible for this session. Browser storage was unavailable.";
      feedback.hidden = false;
    }
  });

  button.addEventListener("click", () => {
    modal.open({ gameId: game.id, review: getReviewForUser(game.id, DEMO_USER_ID) });
  });
  renderReviews();

  document.title = `${game.title} — GameAval.io`;
});
