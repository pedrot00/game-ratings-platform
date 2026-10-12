import { likes as mockLikes } from "../Mocks/likes.js";
import { getUserById } from "../Mocks/users.js";
import { getReviews } from "./reviewStore.js";

// Armazenamento local SOMENTE para demonstrar o fluxo sem uma API.
// Na integracao, estas funcoes passam a chamar o Phoenix, por exemplo:
//   PUT    /api/reviews/:id/like   -> curtir
//   DELETE /api/reviews/:id/like   -> remover a curtida
//   GET    /api/reviews?sort=likes&period=week  (cada review ja traz likeCount e likedByMe)
const STORAGE_KEY = "gameaval.demo.likes.v1";
let changes = readChanges();
let cache = null;

function authorOf(reviewId) {
  return getReviews().find(review => review.id === reviewId)?.userId ?? null;
}

function validEdge(edge) {
  return edge && typeof edge.reviewId === "string" && typeof edge.userId === "string" &&
    getUserById(edge.userId) && typeof edge.liked === "boolean" &&
    !Number.isNaN(Date.parse(edge.updatedAt)) &&
    authorOf(edge.reviewId) !== null && authorOf(edge.reviewId) !== edge.userId;
}

function readChanges() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data.filter(validEdge) : [];
  } catch {
    return [];
  }
}

// Indice em memoria: refeito apenas quando uma curtida muda.
function snapshot() {
  if (cache) return cache;
  // Sobrescreve o mock pelo par (review, usuario): nunca duplica a curtida.
  const byPair = new Map();
  for (const item of [...mockLikes, ...changes]) byPair.set(`${item.reviewId}:${item.userId}`, item);
  const active = [...byPair.values()].filter(item => item.liked);
  const counts = new Map();
  for (const item of active) counts.set(item.reviewId, (counts.get(item.reviewId) ?? 0) + 1);
  cache = { active, counts, pairs: new Set(active.map(item => `${item.reviewId}:${item.userId}`)) };
  return cache;
}

// Todas as curtidas ativas, da mais recente para a mais antiga.
export function getLikes() {
  return [...snapshot().active].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function getLikeCount(reviewId) {
  return snapshot().counts.get(reviewId) ?? 0;
}

export function hasLiked(reviewId, userId) {
  return snapshot().pairs.has(`${reviewId}:${userId}`);
}

export function setLiked({ reviewId, userId, liked }) {
  const author = authorOf(reviewId);
  if (author === null) throw new Error("Review not found.");
  if (!getUserById(userId)) throw new Error("User not found.");
  if (author === userId) throw new Error("You can't like your own review.");
  const item = { reviewId, userId, liked: Boolean(liked), updatedAt: new Date().toISOString() };
  changes = [...changes.filter(change => change.reviewId !== reviewId || change.userId !== userId), item];
  cache = null;
  let persisted = false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
    persisted = true;
  } catch {
    // Continuamos em memoria quando storage estiver bloqueado.
  }
  return { liked: item.liked, count: getLikeCount(reviewId), persisted };
}

export function toggleLike({ reviewId, userId }) {
  return setLiked({ reviewId, userId, liked: !hasLiked(reviewId, userId) });
}
