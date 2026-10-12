import { users } from "../Mocks/users.js";
import { getGameById } from "../Mocks/games.js";
import { getReviews } from "./reviewStore.js";
import { getLikes, getLikeCount } from "./likeStore.js";
import { getGameLog } from "./gameLogStore.js";

// Tudo que a aba Community mostra sobre a comunidade como um todo.
// Sao funcoes puras sobre os stores locais (sem DOM), para testar em Node.
// Na integracao, o Phoenix devolve isto pronto, por exemplo:
//   GET /api/community/stats
//   GET /api/reviews?sort=likes&period=week&limit=6
//   GET /api/reviews?sort=recent&limit=6
//   GET /api/games/trending   e   GET /api/users/top?by=likes
const DAY = 86_400_000;

export const LIKE_PERIODS = [
  { id: "week", label: "This week", days: 7, phrase: "this week" },
  { id: "month", label: "This month", days: 30, phrase: "this month" },
  { id: "all", label: "All time", days: null, phrase: "" }
];

// Inicio da janela. Periodo desconhecido vale como "all time".
function windowStart(period, now) {
  const days = LIKE_PERIODS.find(item => item.id === period)?.days ?? null;
  return days === null ? -Infinity : now - days * DAY;
}

export function getCommunityStats() {
  const reviews = getReviews();
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    members: users.length,
    reviews: reviews.length,
    likes: getLikes().length,
    averageRating: reviews.length ? total / reviews.length : null
  };
}

// Curtidas de uma review dentro do periodo (a curtida conta pela data em que foi dada).
export function countLikes(reviewId, { period = "all", now = Date.now() } = {}) {
  const since = windowStart(period, now);
  return getLikes().filter(like => like.reviewId === reviewId && Date.parse(like.updatedAt) >= since).length;
}

// Ranking por curtidas no periodo. Empate: curtida mais recente, depois review mais nova.
export function getMostLikedReviews({ period = "all", limit = 6, now = Date.now() } = {}) {
  const since = windowStart(period, now);
  const byId = new Map(getReviews().map(review => [review.id, review]));
  const stats = new Map();
  for (const like of getLikes()) {
    const at = Date.parse(like.updatedAt);
    if (at < since || !byId.has(like.reviewId)) continue;
    const entry = stats.get(like.reviewId) ?? { likes: 0, lastLikeAt: 0 };
    entry.likes += 1;
    entry.lastLikeAt = Math.max(entry.lastLikeAt, at);
    stats.set(like.reviewId, entry);
  }
  return [...stats]
    .map(([id, entry]) => ({ review: byId.get(id), likes: entry.likes, total: getLikeCount(id), lastLikeAt: entry.lastLikeAt }))
    .sort((a, b) => b.likes - a.likes || b.lastLikeAt - a.lastLikeAt ||
      b.review.createdAt.localeCompare(a.review.createdAt) || a.review.id.localeCompare(b.review.id))
    .slice(0, limit);
}

// Reviews mais recentes de todo mundo, ou so de alguns autores (userIds).
export function getLatestReviews({ userIds = null, limit } = {}) {
  const authors = userIds ? new Set(userIds) : null;
  const items = getReviews().filter(review => !authors || authors.has(review.userId));
  return typeof limit === "number" ? items.slice(0, limit) : items;
}

// Jogos mais comentados: mais reviews primeiro, depois curtidas recebidas e nota media.
export function getGamesInConversation({ limit = 5 } = {}) {
  const stats = new Map();
  for (const review of getReviews()) {
    if (!getGameById(review.gameId)) continue;
    const entry = stats.get(review.gameId) ?? { gameId: review.gameId, reviews: 0, likes: 0, ratingSum: 0 };
    entry.reviews += 1;
    entry.likes += getLikeCount(review.id);
    entry.ratingSum += review.rating;
    stats.set(review.gameId, entry);
  }
  return [...stats.values()]
    .map(({ ratingSum, ...entry }) => ({ ...entry, average: ratingSum / entry.reviews }))
    .sort((a, b) => b.reviews - a.reviews || b.likes - a.likes || b.average - a.average || a.gameId.localeCompare(b.gameId))
    .slice(0, limit);
}

// Registro de jogos da comunidade: quantos jogadores estao com cada jogo em um status.
// status: "playing" | "planned" | "played". Empate: registro mais recente primeiro.
export function getGameCrowd({ status, limit = 5 } = {}) {
  const stats = new Map();
  for (const entry of getGameLog()) {
    if (entry.status !== status || !getGameById(entry.gameId)) continue;
    const item = stats.get(entry.gameId) ?? { gameId: entry.gameId, players: 0, lastAt: 0 };
    item.players += 1;
    item.lastAt = Math.max(item.lastAt, Date.parse(entry.updatedAt));
    stats.set(entry.gameId, item);
  }
  return [...stats.values()]
    .sort((a, b) => b.players - a.players || b.lastAt - a.lastAt || a.gameId.localeCompare(b.gameId))
    .slice(0, limit)
    .map(({ gameId, players }) => ({ gameId, players }));
}

// Quem mais recebe curtidas nas proprias reviews.
export function getTopReviewers({ limit = 5 } = {}) {
  const stats = new Map();
  for (const review of getReviews()) {
    if (!users.some(user => user.id === review.userId)) continue;
    const entry = stats.get(review.userId) ?? { userId: review.userId, reviews: 0, likes: 0 };
    entry.reviews += 1;
    entry.likes += getLikeCount(review.id);
    stats.set(review.userId, entry);
  }
  return [...stats.values()]
    .sort((a, b) => b.likes - a.likes || b.reviews - a.reviews || a.userId.localeCompare(b.userId))
    .slice(0, limit);
}
