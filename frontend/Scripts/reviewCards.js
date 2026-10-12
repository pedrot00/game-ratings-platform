import { getGameById } from "../Mocks/games.js";
import { DEMO_USER_ID } from "../Mocks/users.js";
import { getPublicUser } from "./userStore.js";
import { createLikeButton } from "./likeButton.js";

const create = (tag, className, value) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
};

// viewerId: quem esta olhando a pagina (curtidas). currentUserId: dono da pagina (editar).
// onLikeChange(liked, persisted, count) deixa a pagina reagir a uma curtida.
export function createReviewCard(review, { currentUserId, onEdit, viewerId = DEMO_USER_ID, onLikeChange } = {}) {
  const user = getPublicUser(review.userId);
  const game = getGameById(review.gameId);
  const item = create("li", "review-item");
  const article = create("article", "review-card");
  if (review.userId === currentUserId) article.classList.add("review-card--mine");

  const header = create("div", "review-card-header");
  const identity = create("div", "review-author");
  const avatar = create("span", "review-avatar", (user?.displayName || "?").slice(0, 1).toUpperCase());
  avatar.setAttribute("aria-hidden", "true");
  const names = create("div", "review-author-text");
  const authorLink = create("a", "review-author-link", user?.displayName || "Unknown user");
  authorLink.href = `profilePage.html?user=${encodeURIComponent(review.userId)}`;
  names.append(authorLink);
  names.append(create("span", "review-handle", `@${user?.username || "unknown"}`));
  identity.append(avatar, names);

  const date = create("time", "review-date", new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC"
  }).format(new Date(review.createdAt)));
  date.dateTime = review.createdAt;
  header.append(identity, date);

  const gameLink = create("a", "review-game", game?.title || "Unknown game");
  gameLink.href = `gamePage.html?game=${encodeURIComponent(review.gameId)}`;

  const stars = create("div", "review-card-rating", "★".repeat(review.rating) + "☆".repeat(5 - review.rating));
  stars.setAttribute("role", "img");
  stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);

  const heading = create("h3", "review-title", review.title);
  const body = create("p", "review-body", review.body);
  article.append(header, gameLink, stars, heading, body);

  // Rodape: curtir a esquerda; "Edited review" e "Edit review" a direita.
  const footer = create("div", "review-card-footer");
  footer.append(createLikeButton({
    reviewId: review.id, authorId: review.userId, authorName: user?.displayName, viewerId, onChange: onLikeChange
  }));
  const actions = create("div", "review-card-actions");
  if (review.updatedAt !== review.createdAt) {
    actions.append(create("span", "review-edited", "Edited review"));
  }
  if (typeof onEdit === "function" && review.userId === currentUserId) {
    const edit = create("button", "review-card-edit", "Edit review");
    edit.type = "button";
    edit.setAttribute("aria-label", `Edit your review of ${game?.title || "this game"}`);
    edit.addEventListener("click", () => onEdit(review));
    actions.append(edit);
  }
  if (actions.children.length) footer.append(actions);
  article.append(footer);
  item.append(article);
  return item;
}
