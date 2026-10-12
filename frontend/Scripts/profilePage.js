import { games, getGameById } from "../Mocks/games.js";
import { DEMO_USER_ID } from "../Mocks/users.js";
import { getPublicUser } from "./userStore.js";
import { getReviewForUser, getReviewsByUser, saveDemoReview } from "./reviewStore.js";
import { createReviewCard } from "./reviewCards.js";
import { mountReviewModal } from "./reviewModal.js";

const make = (tag, className = "", content = "") => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = content;
  return element;
};

function displayDate(date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${date}T00:00:00Z`));
}

function createGameTile(review, { onEdit, isOwner }) {
  const game = getGameById(review.gameId);
  const li = make("li", "profile-game-tile");
  if (!game) return li;
  const link = make("a", "profile-game-cover");
  link.href = `gamePage.html?game=${encodeURIComponent(game.id)}`;
  link.setAttribute("aria-label", `View ${game.title}`);
  const image = document.createElement("img");
  image.src = game.images.coverUrl;
  image.alt = "";
  image.loading = "lazy";
  const fallback = make("span", "profile-game-fallback", game.title);
  image.addEventListener("error", () => link.classList.add("has-no-image"));
  link.append(image, fallback);
  const meta = make("div", "profile-game-info");
  const name = make("a", "profile-game-name", game.title);
  name.href = link.href;
  const stars = make("span", "profile-game-stars", `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`);
  stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);
  meta.append(name, stars);
  if (isOwner) {
    const button = make("button", "profile-text-action", "Edit review");
    button.type = "button";
    button.addEventListener("click", () => onEdit(review));
    meta.append(button);
  }
  li.append(link, meta);
  return li;
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("user") || DEMO_USER_ID;
  const user = getPublicUser(requestedId);
  const page = document.getElementById("profile-page-content");
  if (!user) {
    page.hidden = true;
    document.getElementById("profile-not-found").hidden = false;
    document.title = "Profile not found — GameAval.io";
    return;
  }

  const isOwner = requestedId === DEMO_USER_ID; // Demo identity ONLY, not an authentication check.
  const set = (id, value) => { document.getElementById(id).textContent = value; };
  set("profile-name", user.displayName);
  set("profile-handle", `@${user.username}`);
  set("profile-bio", user.bio || "No biography yet.");
  set("profile-joined", `Member since ${displayDate(user.joinedAt)}`);
  set("profile-avatar", user.displayName.slice(0, 1).toUpperCase());
  document.getElementById("profile-owner-actions").hidden = !isOwner;
  document.getElementById("profile-demo-note").hidden = !isOwner;
  document.title = `${user.displayName} (@${user.username}) — GameAval.io`;

  const chooser = document.getElementById("profile-game-dialog");
  const chooserForm = document.getElementById("profile-game-form");
  const chooserSelect = document.getElementById("profile-game-select");
  const chooserCancel = document.getElementById("profile-game-cancel");
  const feedback = document.getElementById("profile-feedback");
  const sort = document.getElementById("profile-sort");
  const modal = isOwner ? mountReviewModal({
    onSave({ gameId, rating, title, body }) {
      const saved = saveDemoReview({ gameId, userId: DEMO_USER_ID, rating, title, body });
      render();
      feedback.textContent = saved.persisted
        ? "Your review was saved in this browser, not on a server."
        : "Your review was updated in this session. Browser storage is unavailable.";
      feedback.hidden = false;
    }
  }) : null;

  function editReview(review) {
    if (isOwner) modal.open({ gameId: review.gameId, review });
  }

  function render() {
    const reviews = getReviewsByUser(user.id);
    const scored = reviews.reduce((sum, review) => sum + review.rating, 0);
    set("profile-total-reviews", String(reviews.length));
    set("profile-total-games", String(new Set(reviews.map(review => review.gameId)).size));
    set("profile-average", reviews.length ? (scored / reviews.length).toFixed(1) : "—");
    set("profile-reviews-count", `${reviews.length} review${reviews.length === 1 ? "" : "s"}`);
    const sorted = [...reviews].sort((a, b) => {
      if (sort.value === "highest") return b.rating - a.rating || b.createdAt.localeCompare(a.createdAt);
      if (sort.value === "game") return (getGameById(a.gameId)?.title || "").localeCompare(getGameById(b.gameId)?.title || "");
      return b.createdAt.localeCompare(a.createdAt);
    });
    document.getElementById("profile-reviews-list").replaceChildren(
      ...sorted.map(review => createReviewCard(review, { currentUserId: isOwner ? DEMO_USER_ID : null, onEdit: isOwner ? editReview : undefined }))
    );
    document.getElementById("profile-review-empty").hidden = reviews.length > 0;
    document.getElementById("profile-game-grid").replaceChildren(
      ...sorted.map(review => createGameTile(review, { isOwner, onEdit: editReview }))
    );
    document.getElementById("profile-game-empty").hidden = reviews.length > 0;
  }

  sort.addEventListener("change", render);
  if (isOwner) {
    for (const game of [...games].sort((a, b) => a.title.localeCompare(b.title))) {
      const option = document.createElement("option");
      option.value = game.id;
      option.textContent = game.title;
      chooserSelect.append(option);
    }
    document.getElementById("profile-new-review").addEventListener("click", () => {
      chooserForm.reset();
      chooser.showModal();
      chooserSelect.focus();
    });
    chooserCancel.addEventListener("click", () => chooser.close());
    chooser.addEventListener("click", event => { if (event.target === chooser) chooser.close(); });
    chooserForm.addEventListener("submit", event => {
      event.preventDefault();
      if (!chooserForm.reportValidity()) return;
      const gameId = chooserSelect.value;
      const existing = getReviewForUser(gameId, DEMO_USER_ID);
      chooser.close();
      modal.open({ gameId, review: existing });
    });
  }
  render();

  // Registro de jogos: carregado sob demanda para nunca derrubar o perfil.
  import("./profileLog.js")
    .then(({ mountProfileLog }) => mountProfileLog({
      user, isOwner,
      onSaved: message => { feedback.textContent = message; feedback.hidden = false; }
    }))
    .catch(error => console.error("Game log failed to load:", error));

  // Seguir usuarios: tambem sob demanda, pelo mesmo motivo.
  import("./profileFollow.js")
    .then(({ mountProfileFollow }) => mountProfileFollow({
      user, isOwner,
      onSaved: message => { feedback.textContent = message; feedback.hidden = false; }
    }))
    .catch(error => console.error("Follow system failed to load:", error));
});
