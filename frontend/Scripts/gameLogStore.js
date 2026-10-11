import { gameLog as mockLog } from "../Mocks/gameLog.js";
import { getGameById } from "../Mocks/games.js";
import { getUserById } from "../Mocks/users.js";

// Armazenamento local SOMENTE para demonstrar o fluxo sem uma API.
// Na integracao, estas funcoes passam a consultar/gravar endpoints do Phoenix.
const STORAGE_KEY = "gameaval.demo.gamelog.v1";
const REMOVED = "none"; // marca remocao de uma entrada que existe no mock

export const GAME_LOG_STATUSES = [
  { id: "played", label: "Played" },
  { id: "playing", label: "Playing" },
  { id: "planned", label: "Plan to play" }
];
const statusIds = new Set(GAME_LOG_STATUSES.map(status => status.id));
let changes = readChanges();

export const statusLabel = status => GAME_LOG_STATUSES.find(item => item.id === status)?.label ?? "";

function validEntry(entry) {
  return entry && getGameById(entry.gameId) && getUserById(entry.userId) &&
    (statusIds.has(entry.status) || entry.status === REMOVED) &&
    !Number.isNaN(Date.parse(entry.updatedAt));
}

function readChanges() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data.filter(validEntry) : [];
  } catch {
    return [];
  }
}

export function getGameLog() {
  // Sobrescreve o mock pelo par (usuario, jogo): um jogo tem um unico status por usuario.
  const byPair = new Map();
  for (const item of [...mockLog, ...changes]) byPair.set(`${item.userId}:${item.gameId}`, item);
  return [...byPair.values()]
    .filter(item => item.status !== REMOVED)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getLogByUser(userId) {
  return getGameLog().filter(item => item.userId === userId);
}

export function getLogEntry(gameId, userId) {
  return getGameLog().find(item => item.gameId === gameId && item.userId === userId) ?? null;
}

// status = null (ou "") remove o jogo do registro.
export function setGameStatus({ gameId, userId, status }) {
  if (!getGameById(gameId) || !getUserById(userId)) throw new Error("Game or user not found.");
  const next = status || REMOVED;
  if (next !== REMOVED && !statusIds.has(next)) throw new Error("Choose played, playing or plan to play.");
  const item = { userId, gameId, status: next, updatedAt: new Date().toISOString() };
  changes = [...changes.filter(change => change.userId !== userId || change.gameId !== gameId), item];
  let persisted = false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
    persisted = true;
  } catch {
    // Continuamos em memoria quando storage estiver bloqueado.
  }
  return { entry: next === REMOVED ? null : item, persisted };
}
