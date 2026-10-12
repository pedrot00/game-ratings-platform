import { getReviews } from "./reviewStore.js";
import { getGameLog } from "./gameLogStore.js";
import { getFollowingIds } from "./followStore.js";

// Atividade = tudo que um usuario fez e que aparece no feed de quem o segue.
// Hoje: reviews (com a nota) e mudancas no registro de jogos.
// Na integracao, o Phoenix devolve isto pronto em GET /api/feed?type=&limit=&cursor=
export const ACTIVITY_TYPES = [
  { id: "all", label: "All" },
  { id: "review", label: "Reviews & ratings" },
  { id: "log", label: "Game log" }
];

const time = activity => Date.parse(activity.at);

export function getActivities({ userIds, type = "all" }) {
  const authors = new Set(userIds);
  const items = [];
  if (type === "all" || type === "review") {
    for (const review of getReviews()) {
      if (!authors.has(review.userId)) continue;
      items.push({
        id: `review:${review.id}`, type: "review", userId: review.userId, gameId: review.gameId,
        at: review.createdAt, rating: review.rating, title: review.title, body: review.body,
        edited: review.updatedAt !== review.createdAt
      });
    }
  }
  if (type === "all" || type === "log") {
    for (const entry of getGameLog()) {
      if (!authors.has(entry.userId)) continue;
      items.push({
        id: `log:${entry.userId}:${entry.gameId}`, type: "log", userId: entry.userId,
        gameId: entry.gameId, at: entry.updatedAt, status: entry.status
      });
    }
  }
  return items.sort((a, b) => time(b) - time(a) || a.id.localeCompare(b.id));
}

// Feed de um usuario = atividades de quem ele segue (nunca as proprias).
export function getFeedForUser(userId, { type = "all", limit } = {}) {
  const items = getActivities({ userIds: getFollowingIds(userId), type });
  return typeof limit === "number" ? items.slice(0, limit) : items;
}

// Jogos mais movimentados entre as pessoas seguidas (reviews + registros).
export function getPopularGames(userId, limit = 4) {
  const stats = new Map();
  for (const item of getActivities({ userIds: getFollowingIds(userId) })) {
    const entry = stats.get(item.gameId) ?? { gameId: item.gameId, players: new Set(), ratings: [] };
    entry.players.add(item.userId);
    if (item.type === "review") entry.ratings.push(item.rating);
    stats.set(item.gameId, entry);
  }
  return [...stats.values()]
    .map(entry => ({
      gameId: entry.gameId,
      players: entry.players.size,
      average: entry.ratings.length ? entry.ratings.reduce((sum, value) => sum + value, 0) / entry.ratings.length : null
    }))
    .sort((a, b) => b.players - a.players || (b.average ?? 0) - (a.average ?? 0) || a.gameId.localeCompare(b.gameId))
    .slice(0, limit);
}
