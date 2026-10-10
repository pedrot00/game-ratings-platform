import { reviews as mockReviews } from "../Mocks/reviews.js";
import { getGameById } from "../Mocks/games.js";
import { getUserById } from "../Mocks/users.js";

// Armazenamento local SOMENTE para demonstrar o fluxo sem uma API.
// Na integracao, estas funcoes passam a consultar/gravar endpoints do Phoenix.
const STORAGE_KEY = "gameaval.demo.reviews.v1";
let changes = readChanges();

function validReview(review) {
  return review && typeof review.id === "string" &&
    getGameById(review.gameId) && getUserById(review.userId) &&
    Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5 &&
    typeof review.title === "string" && review.title.length <= 90 &&
    typeof review.body === "string" && review.body.length <= 2500 &&
    !Number.isNaN(Date.parse(review.createdAt)) &&
    !Number.isNaN(Date.parse(review.updatedAt));
}

function readChanges() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data.filter(validReview) : [];
  } catch {
    return [];
  }
}

export function getReviews() {
  // Sobrescreve reviews do mock pelo par (usuario, jogo), nunca duplica.
  const byPair = new Map();
  for (const item of [...mockReviews, ...changes]) {
    byPair.set(`${item.userId}:${item.gameId}`, item);
  }
  return [...byPair.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getReviewsByGame(gameId) {
  return getReviews().filter(review => review.gameId === gameId);
}

export function getReviewsByUser(userId) {
  return getReviews().filter(review => review.userId === userId);
}

export function getReviewForUser(gameId, userId) {
  return getReviews().find(review => review.gameId === gameId && review.userId === userId) ?? null;
}

export function saveDemoReview({ gameId, userId, rating, title, body }) {
  const trimmedTitle = String(title ?? "").trim();
  const trimmedBody = String(body ?? "").trim();
  if (!getGameById(gameId) || !getUserById(userId)) throw new Error("Game or user not found.");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Choose a rating from 1 to 5.");
  if (trimmedTitle.length < 3 || trimmedTitle.length > 90) throw new Error("Title must be 3–90 characters.");
  if (trimmedBody.length < 20 || trimmedBody.length > 2500) throw new Error("Review must be 20–2500 characters.");

  const previous = getReviewForUser(gameId, userId);
  const now = new Date().toISOString();
  const review = {
    id: previous?.id ?? `demo-${userId}-${gameId}`,
    gameId, userId, rating,
    title: trimmedTitle, body: trimmedBody,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now
  };
  changes = [...changes.filter(item => item.userId !== userId || item.gameId !== gameId), review];
  let persisted = false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
    persisted = true;
  } catch {
    // Continuamos em memoria quando storage estiver bloqueado.
  }
  return { review, persisted };
}
