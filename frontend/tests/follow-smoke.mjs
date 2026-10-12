import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const stored = new Map();
globalThis.localStorage = {
  getItem(key) { return stored.get(key) ?? null; },
  setItem(key, value) { stored.set(key, value); }
};
// Caminhos relativos a este arquivo (frontend/tests/).
const { DEMO_USER_ID } = await import('../Mocks/users.js');
const { follows } = await import('../Mocks/follows.js');
const { getFollowingIds, getFollowerIds, isFollowing, setFollowing, toggleFollow } = await import('../Scripts/followStore.js');
const { getFeedForUser, getActivities, getPopularGames } = await import('../Scripts/activityStore.js');
const { formatRelative, formatDayLabel } = await import('../Scripts/activityCards.js').catch(() => ({}));

// --- Mock: o perfil demo segue 3 pessoas e nao segue o Jon
assert.ok(follows.every(edge => edge.followerId !== edge.followeeId), 'ninguem segue a si mesmo no mock');
assert.deepEqual([...getFollowingIds(DEMO_USER_ID)].sort(), ['u-aria', 'u-leo', 'u-maya']);
assert.deepEqual([...getFollowerIds(DEMO_USER_ID)].sort(), ['u-aria', 'u-jon']);
assert.equal(isFollowing(DEMO_USER_ID, 'u-jon'), false);

// --- Validacoes
assert.throws(() => setFollowing({ followerId: DEMO_USER_ID, followeeId: DEMO_USER_ID, following: true }), /yourself/);
assert.throws(() => setFollowing({ followerId: DEMO_USER_ID, followeeId: 'ghost', following: true }), /not found/);
assert.throws(() => setFollowing({ followerId: 'ghost', followeeId: 'u-aria', following: true }), /not found/);

// --- Feed: so quem o usuario segue, nunca o proprio, mais recente primeiro
const feed = getFeedForUser(DEMO_USER_ID);
assert.ok(feed.length > 0);
assert.ok(feed.every(item => ['u-aria', 'u-leo', 'u-maya'].includes(item.userId)), 'feed so tem pessoas seguidas');
assert.ok(feed.every(item => item.userId !== DEMO_USER_ID && item.userId !== 'u-jon'));
for (let i = 1; i < feed.length; i++) assert.ok(Date.parse(feed[i - 1].at) >= Date.parse(feed[i].at), 'ordenado por data desc');
assert.ok(feed.some(item => item.type === 'review') && feed.some(item => item.type === 'log'));
assert.ok(getFeedForUser(DEMO_USER_ID, { type: 'review' }).every(item => item.type === 'review' && item.rating >= 1 && item.rating <= 5));
assert.ok(getFeedForUser(DEMO_USER_ID, { type: 'log' }).every(item => item.type === 'log' && item.status));
assert.equal(getFeedForUser(DEMO_USER_ID, { limit: 6 }).length, 6);
assert.equal(new Set(feed.map(item => item.id)).size, feed.length, 'ids de atividade unicos');
assert.equal(getFeedForUser('u-maya').every(item => ['u-aria'].includes(item.userId)), true);
assert.deepEqual(getActivities({ userIds: [] }), []);

// --- Seguir / deixar de seguir
const jonBefore = feed.length;
const followed = toggleFollow({ followerId: DEMO_USER_ID, followeeId: 'u-jon' });
assert.equal(followed.following, true);
assert.equal(followed.persisted, true);
assert.ok(isFollowing(DEMO_USER_ID, 'u-jon'));
assert.ok(getFollowerIds('u-jon').includes(DEMO_USER_ID));
assert.ok(getFeedForUser(DEMO_USER_ID).length > jonBefore, 'seguir o Jon traz as atividades dele pro feed');
assert.ok(getFeedForUser(DEMO_USER_ID).some(item => item.userId === 'u-jon'));
setFollowing({ followerId: DEMO_USER_ID, followeeId: 'u-jon', following: true });
assert.equal(getFollowingIds(DEMO_USER_ID).filter(id => id === 'u-jon').length, 1, 'nao duplica a relacao');

// Deixar de seguir alguem que vem do mock
assert.equal(toggleFollow({ followerId: DEMO_USER_ID, followeeId: 'u-aria' }).following, false);
assert.ok(!getFollowingIds(DEMO_USER_ID).includes('u-aria'));
assert.ok(getFeedForUser(DEMO_USER_ID).every(item => item.userId !== 'u-aria'));
const saved = JSON.parse(stored.get('gameaval.demo.follows.v1'));
assert.ok(Array.isArray(saved) && saved.every(edge => Object.keys(edge).sort().join() === 'followeeId,followerId,following,updatedAt'));

// Deixar de seguir todo mundo: feed vazio, sem erro
for (const id of [...getFollowingIds(DEMO_USER_ID)]) setFollowing({ followerId: DEMO_USER_ID, followeeId: id, following: false });
assert.deepEqual(getFeedForUser(DEMO_USER_ID), []);
assert.deepEqual(getPopularGames(DEMO_USER_ID), []);

// --- Jogos em alta
setFollowing({ followerId: DEMO_USER_ID, followeeId: 'u-aria', following: true });
setFollowing({ followerId: DEMO_USER_ID, followeeId: 'u-leo', following: true });
const popular = getPopularGames(DEMO_USER_ID, 3);
assert.equal(popular.length, 3);
assert.ok(popular[0].players >= popular[1].players && popular[1].players >= popular[2].players);

// --- Datas relativas (so se o modulo de cards carregou sem DOM)
if (formatRelative) {
  const now = Date.parse('2026-10-11T12:00:00Z');
  assert.equal(formatRelative('2026-10-11T11:59:40Z', now), 'just now');
  assert.equal(formatRelative('2026-10-11T11:15:00Z', now), '45m ago');
  assert.equal(formatRelative('2026-10-11T09:00:00Z', now), '3h ago');
  assert.equal(formatRelative('2026-10-08T12:00:00Z', now), '3d ago');
  assert.match(formatRelative('2026-09-01T12:00:00Z', now), /Sep 1, 2026/);
  assert.equal(formatDayLabel('2026-10-11T01:00:00Z', now), 'Today');
  assert.equal(formatDayLabel('2026-10-10T23:00:00Z', now), 'Yesterday');
  assert.match(formatDayLabel('2026-10-03T10:00:00Z', now), /October 3, 2026/);
}

// --- HTML: todo id que os scripts procuram existe na pagina certa
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
function assertIds(script, page) {
  const source = read(`../Scripts/${script}`);
  const html = read(`../Pages/${page}`);
  const ids = [...source.matchAll(/(?:getElementById|byId)\("([^"]+)"\)/g)].map(match => match[1]);
  assert.ok(ids.length > 0, `${script} usa ids`);
  for (const id of new Set(ids)) assert.match(html, new RegExp(`id="${id}"`), `${page} precisa de id="${id}" (usado em ${script})`);
}
assertIds('activityPage.js', 'activityPage.html');
assertIds('activityPreview.js', 'mainPage.html');
assertIds('profileFollow.js', 'profilePage.html');
const main = read('../Pages/mainPage.html');
assert.match(main, /href="activityPage\.html">See more/);
assert.match(main, /activity\.css/);
assert.match(main, /activityPreview\.js/);
assert.ok(main.indexOf('id="activity-preview"') < main.indexOf('aria-labelledby="browse-title"'), 'previa vem antes de Browse');
for (const page of ['mainPage', 'profilePage', 'searchPage', 'gamePage', 'accountPage']) {
  assert.match(read(`../Pages/${page}.html`), /href="activityPage\.html"/, `${page} liga para Activity`);
}
const activity = read('../Pages/activityPage.html');
assert.match(activity, /type="module"/);
assert.match(activity, /Style\/style\.css/);
assert.doesNotMatch(read('../Scripts/activityCards.js') + read('../Scripts/activityPage.js') + read('../Scripts/profileFollow.js'), /innerHTML/, 'sem innerHTML: so textContent');
console.log('PASS: follow store (seguir, deixar de seguir, sem duplicar, validacoes), feed so de quem segue e ordenado, filtros, jogos em alta, datas e ids das paginas.');
