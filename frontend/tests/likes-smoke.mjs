import assert from 'node:assert/strict';
const stored = new Map();
globalThis.localStorage = {
  getItem(key) { return stored.get(key) ?? null; },
  setItem(key, value) { stored.set(key, value); }
};
// Caminhos relativos a este arquivo (frontend/tests/).
const { DEMO_USER_ID, getUserById } = await import('../Mocks/users.js');
const { reviews } = await import('../Mocks/reviews.js');
const { likes } = await import('../Mocks/likes.js');
const { getReviews } = await import('../Scripts/reviewStore.js');
const { getLikes, getLikeCount, hasLiked, setLiked, toggleLike } = await import('../Scripts/likeStore.js');
const KEY = 'gameaval.demo.likes.v1';

// --- Mock: integridade
const byId = new Map(reviews.map(review => [review.id, review]));
assert.equal(likes.length, 46);
assert.equal(new Set(likes.map(item => `${item.reviewId}:${item.userId}`)).size, likes.length, 'uma curtida por par (review, usuario)');
for (const item of likes) {
  const review = byId.get(item.reviewId);
  assert.ok(review, `review existe: ${item.reviewId}`);
  assert.ok(getUserById(item.userId), `usuario existe: ${item.userId}`);
  assert.notEqual(item.userId, review.userId, 'ninguem curte a propria review');
  assert.equal(item.liked, true);
  assert.ok(Date.parse(item.updatedAt) >= Date.parse(review.createdAt), `curtida depois da review: ${item.reviewId}`);
}
assert.equal(getLikes().length, 46);
for (let i = 1; i < getLikes().length; i++) {
  assert.ok(Date.parse(getLikes()[i - 1].updatedAt) >= Date.parse(getLikes()[i].updatedAt), 'mais recente primeiro');
}

// --- Contagens e estado inicial do perfil demo
assert.equal(getLikeCount('rv-001'), 4);
assert.equal(getLikeCount('rv-012'), 4);
assert.equal(getLikeCount('rv-015'), 0);
assert.equal(getLikeCount('nao-existe'), 0);
assert.equal(hasLiked('rv-001', DEMO_USER_ID), true);
assert.equal(hasLiked('rv-004', DEMO_USER_ID), false);
assert.equal(hasLiked('rv-001', 'u-aria'), false, 'o autor nao curte a propria review');

// --- Validacoes
assert.throws(() => setLiked({ reviewId: 'rv-003', userId: DEMO_USER_ID, liked: true }), /own review/);
assert.throws(() => setLiked({ reviewId: 'nao-existe', userId: DEMO_USER_ID, liked: true }), /Review not found/);
assert.throws(() => setLiked({ reviewId: 'rv-004', userId: 'ghost', liked: true }), /User not found/);
assert.equal(stored.has(KEY), false, 'erro nao grava nada');

// --- Curtir e descurtir
const liked = toggleLike({ reviewId: 'rv-004', userId: DEMO_USER_ID });
assert.deepEqual({ liked: liked.liked, count: liked.count, persisted: liked.persisted }, { liked: true, count: 4, persisted: true });
assert.equal(hasLiked('rv-004', DEMO_USER_ID), true);
assert.equal(setLiked({ reviewId: 'rv-004', userId: DEMO_USER_ID, liked: true }).count, 4, 'curtir de novo nao duplica');
assert.equal(toggleLike({ reviewId: 'rv-004', userId: DEMO_USER_ID }).count, 3);
assert.equal(hasLiked('rv-004', DEMO_USER_ID), false);

// Descurtir uma curtida que vem do mock
assert.equal(toggleLike({ reviewId: 'rv-001', userId: DEMO_USER_ID }).count, 3);
assert.equal(hasLiked('rv-001', DEMO_USER_ID), false);
assert.equal(getLikes().length, 46 - 1, 'total acompanha as curtidas ativas');
assert.equal(getLikes().length, getReviews().reduce((sum, review) => sum + getLikeCount(review.id), 0), 'soma das contagens = total');
toggleLike({ reviewId: 'rv-001', userId: DEMO_USER_ID });
assert.equal(getLikeCount('rv-001'), 4);

// Curtidas guardadas: so os campos do contrato
const saved = JSON.parse(stored.get(KEY));
assert.ok(Array.isArray(saved) && saved.length === 2, 'um registro por par alterado');
assert.ok(saved.every(edge => Object.keys(edge).sort().join() === 'liked,reviewId,updatedAt,userId'));

// --- Recarregar a pagina: um modulo novo le o que foi gravado
const reloaded = await import('../Scripts/likeStore.js?reload=1');
assert.equal(reloaded.getLikeCount('rv-001'), 4);
assert.equal(reloaded.hasLiked('rv-001', DEMO_USER_ID), true);
toggleLike({ reviewId: 'rv-004', userId: DEMO_USER_ID });
const reloadedAgain = await import('../Scripts/likeStore.js?reload=2');
assert.equal(reloadedAgain.hasLiked('rv-004', DEMO_USER_ID), true);
assert.equal(reloadedAgain.getLikeCount('rv-004'), 4);

// --- Dados corrompidos ou invalidos no storage sao ignorados
stored.set(KEY, '{nao e json');
assert.equal((await import('../Scripts/likeStore.js?bad=1')).getLikeCount('rv-004'), 3, 'JSON invalido volta ao mock');
stored.set(KEY, JSON.stringify([
  { reviewId: 'rv-003', userId: DEMO_USER_ID, liked: true, updatedAt: '2026-10-10T10:00:00.000Z' },
  { reviewId: 'fantasma', userId: DEMO_USER_ID, liked: true, updatedAt: '2026-10-10T10:00:00.000Z' },
  { reviewId: 'rv-004', userId: 'ghost', liked: true, updatedAt: '2026-10-10T10:00:00.000Z' },
  { reviewId: 'rv-004', userId: DEMO_USER_ID, liked: 'sim', updatedAt: '2026-10-10T10:00:00.000Z' }
]));
const sanitized = await import('../Scripts/likeStore.js?bad=2');
assert.equal(sanitized.getLikeCount('rv-003'), 3, 'curtida na propria review e descartada');
assert.equal(sanitized.getLikeCount('rv-004'), 3);

// --- Storage bloqueado: continua em memoria e avisa
const original = globalThis.localStorage.setItem;
globalThis.localStorage.setItem = () => { throw new Error('blocked'); };
const memoryOnly = setLiked({ reviewId: 'rv-008', userId: DEMO_USER_ID, liked: true });
assert.equal(memoryOnly.persisted, false);
assert.equal(memoryOnly.liked, true);
assert.equal(hasLiked('rv-008', DEMO_USER_ID), true);
globalThis.localStorage.setItem = original;

console.log('PASS: mock de 46 curtidas valido, contagens, curtir/descurtir sem duplicar, regra da propria review, persistencia, storage invalido e bloqueado.');
