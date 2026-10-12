import assert from 'node:assert/strict';
const stored = new Map();
globalThis.localStorage = {
  getItem(key) { return stored.get(key) ?? null; },
  setItem(key, value) { stored.set(key, value); }
};
// Caminhos relativos a este arquivo (frontend/tests/).
const { DEMO_USER_ID } = await import('../Mocks/users.js');
const { toggleLike, getLikeCount } = await import('../Scripts/likeStore.js');
const { setFollowing } = await import('../Scripts/followStore.js');
const {
  LIKE_PERIODS, getCommunityStats, countLikes, getMostLikedReviews, getLatestReviews,
  getGamesInConversation, getGameCrowd, getTopReviewers
} = await import('../Scripts/communityStore.js');

// "Agora" fixo: os mocks sao de 2026 e os periodos dependem da data atual.
const now = Date.parse('2026-10-11T12:00:00Z');
const ids = list => list.map(item => item.review?.id ?? item.id ?? item.gameId ?? item.userId);

// --- Numeros gerais
const stats = getCommunityStats();
assert.equal(stats.members, 5);
assert.equal(stats.reviews, 20);
assert.equal(stats.likes, 46);
assert.ok(Math.abs(stats.averageRating - 4.55) < 1e-9);
assert.deepEqual(LIKE_PERIODS.map(period => period.id), ['week', 'month', 'all']);

// --- Reviews mais curtidas: todo o periodo
const allTime = getMostLikedReviews({ limit: 6, now });
assert.deepEqual(ids(allTime), ['rv-012', 'rv-009', 'rv-001', 'rv-006', 'rv-007', 'rv-018'],
  'mais curtidas primeiro; empate pela curtida mais recente');
assert.ok(allTime.every((item, i) => i === 0 || allTime[i - 1].likes >= item.likes));
assert.ok(allTime.every(item => item.likes === item.total), 'em "all time", curtidas do periodo = total');
assert.equal(getMostLikedReviews({ limit: 50, now }).length, 19, 'so aparecem reviews com pelo menos uma curtida');
assert.equal(getMostLikedReviews({ limit: 2, now }).length, 2);
assert.deepEqual(ids(getMostLikedReviews({ period: 'qualquer', limit: 6, now })), ids(allTime), 'periodo desconhecido = all time');

// --- Esta semana (desde 4 de outubro) e este mes
const week = getMostLikedReviews({ period: 'week', limit: 50, now });
assert.deepEqual(ids(week).slice(0, 3), ['rv-012', 'rv-018', 'rv-019']);
assert.ok(!ids(week).includes('rv-006'), 'review com curtidas antigas fica fora da semana');
assert.ok(week.every(item => item.likes <= item.total));
assert.equal(week.find(item => item.review.id === 'rv-009').likes, 1);
assert.equal(week.find(item => item.review.id === 'rv-009').total, 4);
assert.equal(countLikes('rv-012', { period: 'week', now }), 4);
assert.equal(countLikes('rv-006', { period: 'week', now }), 0);
assert.equal(countLikes('rv-006', { period: 'all', now }), 4);
const month = ids(getMostLikedReviews({ period: 'month', limit: 50, now }));
assert.ok(month.includes('rv-011') && !month.includes('rv-006') && !month.includes('rv-008'));

// --- Mais recentes
assert.equal(getLatestReviews()[0].id, 'rv-020');
assert.equal(getLatestReviews().length, 20);
assert.deepEqual(ids(getLatestReviews({ userIds: ['u-aria'] })), ['rv-012', 'rv-017', 'rv-001', 'rv-006']);
assert.deepEqual(getLatestReviews({ userIds: [] }), [], 'sem autores = nada');
assert.equal(getLatestReviews({ limit: 3 }).length, 3);
for (const [i, review] of getLatestReviews().entries()) {
  if (i) assert.ok(getLatestReviews()[i - 1].createdAt >= review.createdAt, 'mais nova primeiro');
}

// --- Jogos mais comentados
const games = getGamesInConversation({ limit: 6 });
assert.deepEqual(games.map(game => game.gameId), ['rdr2', 'elden', 'bg3', 'cyberpunk', 'outerwilds', 'witcher3']);
assert.deepEqual({ reviews: games[0].reviews, likes: games[0].likes }, { reviews: 3, likes: 9 });
assert.ok(Math.abs(games[0].average - 14 / 3) < 1e-9);
assert.equal(getGamesInConversation({ limit: 50 }).length, 14);

// --- Registro de jogos da comunidade
assert.deepEqual(getGameCrowd({ status: 'playing' }).map(item => item.gameId), ['minecraft', 'horizon', 'bg3', 'outerwilds']);
assert.deepEqual(getGameCrowd({ status: 'planned', limit: 3 }).map(item => item.gameId), ['ff16', 'witcher3', 'zelda']);
assert.ok(getGameCrowd({ status: 'played' }).every(item => item.players >= 1));
assert.equal(getGameCrowd({ status: 'played' })[0].players >= getGameCrowd({ status: 'played' }).at(-1).players, true);
assert.deepEqual(getGameCrowd({ status: 'inexistente' }), []);

// --- Quem mais recebe curtidas
const top = getTopReviewers({ limit: 10 });
assert.deepEqual(top.map(item => [item.userId, item.likes, item.reviews]), [
  ['u-aria', 15, 4], [DEMO_USER_ID, 9, 4], ['u-jon', 8, 4], ['u-maya', 8, 4], ['u-leo', 6, 4]
]);
assert.equal(top.reduce((sum, item) => sum + item.likes, 0), stats.likes, 'soma por pessoa = total de curtidas');
assert.equal(getTopReviewers({ limit: 2 }).length, 2);

// --- Curtir muda os rankings e os numeros
toggleLike({ reviewId: 'rv-017', userId: DEMO_USER_ID });
assert.equal(getLikeCount('rv-017'), 4);
assert.equal(getCommunityStats().likes, 47);
assert.ok(ids(getMostLikedReviews({ limit: 5, now })).includes('rv-017'), 'entra no grupo de 4 curtidas');
assert.equal(getTopReviewers({ limit: 1 })[0].likes, 16);
assert.equal(getMostLikedReviews({ period: 'week', limit: 50, now }).find(item => item.review.id === 'rv-017')?.likes, 1,
  'a curtida nova conta na semana (data de hoje)');
toggleLike({ reviewId: 'rv-017', userId: DEMO_USER_ID });
assert.equal(getCommunityStats().likes, 46);

// --- Perfil seguido alimenta o filtro "People you follow"
setFollowing({ followerId: DEMO_USER_ID, followeeId: 'u-jon', following: true });
const { getFollowingIds } = await import('../Scripts/followStore.js');
assert.deepEqual(ids(getLatestReviews({ userIds: getFollowingIds(DEMO_USER_ID).filter(id => id === 'u-jon') })), ['rv-005', 'rv-009', 'rv-013', 'rv-016'].sort((a, b) => {
  const date = id => getLatestReviews().find(review => review.id === id).createdAt;
  return date(b).localeCompare(date(a));
}));

console.log('PASS: numeros gerais, mais curtidas (semana/mes/todo o periodo), mais recentes, jogos em alta, registro da comunidade, top reviewers e efeito de curtir.');
