import { DEMO_USER_ID } from "../Mocks/users.js";
import { getGameById } from "../Mocks/games.js";
import { getPublicUser } from "./userStore.js";
import { getFollowingIds } from "./followStore.js";
import { createReviewCard } from "./reviewCards.js";
import { createPersonRow } from "./activityCards.js";
import { LIKE_EVENT, formatLikes } from "./likeButton.js";
import {
  LIKE_PERIODS, getCommunityStats, countLikes, getMostLikedReviews, getLatestReviews,
  getGamesInConversation, getGameCrowd, getTopReviewers
} from "./communityStore.js";

const LIKED_LIMIT = 6;
const LATEST_PAGE_SIZE = 6;
const SIDE_LIMIT = 5;

const LATEST_TABS = [
  { id: "everyone", label: "Everyone" },
  { id: "following", label: "People you follow" }
];
const CROWD_TABS = [
  { id: "playing", label: "Playing now" },
  { id: "planned", label: "Plan to play" }
];

const make = (tag, className = "", content = "") => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = content;
  return element;
};
const byId = id => document.getElementById(id);
const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

// Grupo de botoes de filtro (mesmo visual da pagina Activity).
function mountTabs(container, tabs, initial, onSelect) {
  let current = initial;
  const buttons = new Map();
  const paint = () => {
    for (const [id, button] of buttons) {
      button.classList.toggle("is-active", id === current);
      button.setAttribute("aria-pressed", String(id === current));
    }
  };
  for (const tab of tabs) {
    const button = make("button", "filter", tab.label);
    button.type = "button";
    button.addEventListener("click", () => {
      if (current === tab.id) return;
      current = tab.id;
      paint();
      onSelect(current);
    });
    buttons.set(tab.id, button);
    container.append(button);
  }
  paint();
  return { get value() { return current; } };
}

// Linha de jogo (capa + titulo + detalhe), com o visual de "Popular with your circle".
function createGameRow(gameId, detail) {
  const game = getGameById(gameId);
  const item = make("li", "popular-item");
  if (!game) return item;
  const cover = make("a", "popular-cover");
  cover.href = `gamePage.html?game=${encodeURIComponent(game.id)}`;
  cover.setAttribute("aria-label", `View ${game.title}`);
  const image = document.createElement("img");
  image.src = game.images.coverUrl;
  image.alt = "";
  image.loading = "lazy";
  image.addEventListener("error", () => cover.classList.add("has-no-image"));
  cover.append(image);
  const text = make("div", "popular-text");
  const title = make("a", "popular-title", game.title);
  title.href = cover.href;
  text.append(title, make("span", "popular-meta", detail));
  item.append(cover, text);
  return item;
}

document.addEventListener("DOMContentLoaded", () => {
  const likedList = byId("liked-list");
  const likedEmpty = byId("liked-empty");
  const latestList = byId("latest-list");
  const latestEmpty = byId("latest-empty");
  const latestMore = byId("latest-more");
  const feedback = byId("community-feedback");
  let latestShown = LATEST_PAGE_SIZE;

  const periodLabel = id => LIKE_PERIODS.find(period => period.id === id) ?? LIKE_PERIODS.at(-1);
  const rankNote = (likes, period) => [formatLikes(likes), periodLabel(period).phrase].filter(Boolean).join(" ");

  function renderStats() {
    const stats = getCommunityStats();
    byId("stat-members").textContent = stats.members.toLocaleString("en-US");
    byId("stat-reviews").textContent = stats.reviews.toLocaleString("en-US");
    byId("stat-likes").textContent = stats.likes.toLocaleString("en-US");
    byId("stat-rating").textContent = stats.averageRating === null ? "—" : `★ ${stats.averageRating.toFixed(1)}`;
  }

  // Curtir muda totais e ranking de pessoas, mas nao reordena as listas:
  // os cards ficam onde estao e so a contagem muda (nada pula debaixo do mouse).
  function onLikeChange(liked, persisted) {
    renderStats();
    renderReviewers();
    feedback.hidden = persisted;
    if (!persisted) feedback.textContent = "Browser storage is unavailable, so your likes only last for this session.";
  }

  // ---- Reviews mais curtidas
  const likedTabs = mountTabs(byId("liked-filters"), LIKE_PERIODS, "all", () => renderLiked());

  function renderLiked() {
    const period = likedTabs.value;
    const items = getMostLikedReviews({ period, limit: LIKED_LIMIT });
    byId("liked-description").textContent = period === "all"
      ? "Ranked by total likes."
      : `Ranked by likes received ${periodLabel(period).phrase}.`;
    byId("liked-count").textContent = items.length ? `top ${items.length}` : "";

    likedList.replaceChildren(...items.map(({ review, likes }, index) => {
      const card = createReviewCard(review, { currentUserId: DEMO_USER_ID, onLikeChange });
      const article = card.querySelector(".review-card");
      if (index === 0) article.classList.add("review-card--top");
      const ribbon = make("div", "community-ribbon");
      ribbon.dataset.reviewId = review.id;
      ribbon.append(make("span", "community-rank", `#${index + 1}`), make("span", "community-rank-note", rankNote(likes, period)));
      article.prepend(ribbon);
      return card;
    }));

    likedEmpty.hidden = items.length > 0;
    if (!items.length) {
      byId("liked-empty-title").textContent = `No likes ${periodLabel(period).phrase}`.trim();
      byId("liked-empty-text").textContent = "Like a review below and it will show up here. Try \"All time\" to see older favorites.";
    }
  }

  // O texto "N likes esta semana" acompanha as curtidas dadas nesta pagina.
  document.addEventListener(LIKE_EVENT, event => {
    const period = likedTabs.value;
    for (const ribbon of likedList.querySelectorAll(".community-ribbon")) {
      if (ribbon.dataset.reviewId !== event.detail.reviewId) continue;
      ribbon.querySelector(".community-rank-note").textContent = rankNote(countLikes(event.detail.reviewId, { period }), period);
    }
  });

  // ---- Reviews mais recentes
  const latestTabs = mountTabs(byId("latest-filters"), LATEST_TABS, "everyone", () => {
    latestShown = LATEST_PAGE_SIZE;
    renderLatest();
  });
  latestMore.addEventListener("click", () => { latestShown += LATEST_PAGE_SIZE; renderLatest(); });

  function renderLatest() {
    const following = latestTabs.value === "following";
    const followingIds = getFollowingIds(DEMO_USER_ID);
    const items = getLatestReviews({ userIds: following ? followingIds : null });
    const visible = items.slice(0, latestShown);
    latestList.replaceChildren(...visible.map(review => createReviewCard(review, { currentUserId: DEMO_USER_ID, onLikeChange })));
    byId("latest-count").textContent = items.length ? plural(items.length, "review") : "";

    latestEmpty.hidden = items.length > 0;
    if (!items.length) {
      byId("latest-empty-title").textContent = followingIds.length ? "Nothing from your circle yet" : "You're not following anyone yet";
      byId("latest-empty-text").textContent = followingIds.length
        ? "The players you follow haven't written a review yet."
        : "Follow a few players from the Top reviewers list and their reviews will show up here.";
    }
    const remaining = items.length - visible.length;
    latestMore.hidden = remaining <= 0;
    latestMore.textContent = `Show more (${remaining} left)`;
  }

  // ---- Painel lateral
  function renderGames() {
    const games = getGamesInConversation({ limit: SIDE_LIMIT });
    byId("community-games").replaceChildren(...games.map(stat =>
      createGameRow(stat.gameId, `${plural(stat.reviews, "review")} · ★ ${stat.average.toFixed(1)}`)));
    byId("community-games-panel").hidden = games.length === 0;
  }

  const crowdTabs = mountTabs(byId("crowd-filters"), CROWD_TABS, "playing", () => renderCrowd());
  function renderCrowd() {
    const crowd = getGameCrowd({ status: crowdTabs.value, limit: SIDE_LIMIT });
    byId("community-crowd").replaceChildren(...crowd.map(item => createGameRow(item.gameId, plural(item.players, "player"))));
    byId("community-crowd-empty").hidden = crowd.length > 0;
  }

  function onFollowChange() {
    // Seguir ou deixar de seguir muda o filtro "People you follow".
    renderLatest();
  }

  function renderReviewers() {
    const rows = getTopReviewers({ limit: SIDE_LIMIT })
      .map(item => ({ user: getPublicUser(item.userId), item }))
      .filter(({ user }) => user)
      .map(({ user, item }) => createPersonRow(user, {
        note: `${formatLikes(item.likes)} · ${plural(item.reviews, "review")}`,
        onChange: onFollowChange
      }));
    byId("community-reviewers").replaceChildren(...rows);
    byId("community-reviewers-panel").hidden = rows.length === 0;
  }

  renderStats();
  renderLiked();
  renderLatest();
  renderGames();
  renderCrowd();
  renderReviewers();

  document.querySelectorAll('a[href="#"]').forEach(link => {
    link.addEventListener("click", event => event.preventDefault());
  });
});
