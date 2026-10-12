import { DEMO_USER_ID } from "../Mocks/users.js";
import { getLikeCount, hasLiked, toggleLike } from "./likeStore.js";

const SVG_NS = "http://www.w3.org/2000/svg";
export const LIKE_EVENT = "gameaval:like-change";

const make = (tag, className = "", content = "") => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = content;
  return element;
};

// Coracao desenhado aqui para nao depender do sprite de icones de cada pagina.
function createHeart() {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.classList.add("like-icon");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z");
  svg.append(path);
  return svg;
}

export const formatLikes = count => `${count.toLocaleString("en-US")} ${count === 1 ? "like" : "likes"}`;

// Botao de curtir, reutilizado em qualquer lugar que mostre uma review.
// - A propria review nao pode ser curtida: mostra so a contagem.
// - Varios botoes da mesma review na pagina ficam sincronizados por um evento.
// onChange(liked, persisted, count) deixa a pagina atualizar o que depende das curtidas.
export function createLikeButton({ reviewId, authorId, authorName = "this player", viewerId = DEMO_USER_ID, onChange } = {}) {
  if (authorId === viewerId) {
    const own = make("p", "like-static");
    own.append(createHeart(), make("span", "like-count"));
    const paintOwn = () => {
      const count = getLikeCount(reviewId);
      own.lastChild.textContent = count ? formatLikes(count) : "No likes yet";
    };
    paintOwn();
    document.addEventListener(LIKE_EVENT, function sync(event) {
      if (!own.isConnected) return document.removeEventListener(LIKE_EVENT, sync);
      if (event.detail.reviewId === reviewId) paintOwn();
    });
    return own;
  }

  const button = make("button", "like-btn");
  button.type = "button";
  const hidden = make("span", "visually-hidden", `Like this review by ${authorName}. Total: `);
  const count = make("span", "like-count");
  button.append(createHeart(), hidden, count);

  function paint() {
    const liked = hasLiked(reviewId, viewerId);
    const total = getLikeCount(reviewId);
    button.setAttribute("aria-pressed", String(liked));
    count.textContent = total ? total.toLocaleString("en-US") : "Like";
    hidden.textContent = total ? `Like this review by ${authorName}. Total: ` : `Like this review by ${authorName}`;
  }

  button.addEventListener("animationend", () => button.classList.remove("is-popping"));
  button.addEventListener("click", () => {
    try {
      const result = toggleLike({ reviewId, userId: viewerId });
      document.dispatchEvent(new CustomEvent(LIKE_EVENT, { detail: { reviewId, liked: result.liked } }));
      if (result.liked) button.classList.add("is-popping");
      onChange?.(result.liked, result.persisted, result.count);
    } catch (error) {
      button.title = error.message;
      console.error("Could not update like:", error);
    }
  });
  document.addEventListener(LIKE_EVENT, function sync(event) {
    if (!button.isConnected) return document.removeEventListener(LIKE_EVENT, sync);
    if (event.detail.reviewId === reviewId) paint();
  });
  paint();
  return button;
}
