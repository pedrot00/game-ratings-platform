import { follows as mockFollows } from "../Mocks/follows.js";
import { getUserById } from "../Mocks/users.js";

// Armazenamento local SOMENTE para demonstrar o fluxo sem uma API.
// Na integracao, estas funcoes passam a chamar o Phoenix, por exemplo:
//   POST   /api/users/:id/follow      -> seguir
//   DELETE /api/users/:id/follow      -> deixar de seguir
//   GET    /api/users/:id/following   e   GET /api/users/:id/followers
const STORAGE_KEY = "gameaval.demo.follows.v1";
let changes = readChanges();

function validEdge(edge) {
  return edge && typeof edge.followerId === "string" && typeof edge.followeeId === "string" &&
    edge.followerId !== edge.followeeId &&
    getUserById(edge.followerId) && getUserById(edge.followeeId) &&
    typeof edge.following === "boolean" && !Number.isNaN(Date.parse(edge.updatedAt));
}

function readChanges() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data.filter(validEdge) : [];
  } catch {
    return [];
  }
}

export function getFollows() {
  // Sobrescreve o mock pelo par (seguidor, seguido): nunca duplica a relacao.
  const byPair = new Map();
  for (const item of [...mockFollows, ...changes]) byPair.set(`${item.followerId}:${item.followeeId}`, item);
  return [...byPair.values()]
    .filter(item => item.following)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function getFollowingIds(userId) {
  return getFollows().filter(item => item.followerId === userId).map(item => item.followeeId);
}

export function getFollowerIds(userId) {
  return getFollows().filter(item => item.followeeId === userId).map(item => item.followerId);
}

export function isFollowing(followerId, followeeId) {
  return getFollows().some(item => item.followerId === followerId && item.followeeId === followeeId);
}

export function setFollowing({ followerId, followeeId, following }) {
  if (!getUserById(followerId) || !getUserById(followeeId)) throw new Error("User not found.");
  if (followerId === followeeId) throw new Error("You can't follow yourself.");
  const item = { followerId, followeeId, following: Boolean(following), updatedAt: new Date().toISOString() };
  changes = [...changes.filter(change => change.followerId !== followerId || change.followeeId !== followeeId), item];
  let persisted = false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
    persisted = true;
  } catch {
    // Continuamos em memoria quando storage estiver bloqueado.
  }
  return { following: item.following, persisted };
}

export function toggleFollow({ followerId, followeeId }) {
  return setFollowing({ followerId, followeeId, following: !isFollowing(followerId, followeeId) });
}
