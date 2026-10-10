import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
const stored = new Map();
globalThis.localStorage = {
  getItem(key) { return stored.get(key) ?? null; },
  setItem(key, value) { stored.set(key, value); }
};
const { users, DEMO_USER_ID } = await import('../frontend/Mocks/users.js');
const { games } = await import('../frontend/Mocks/games.js');
const { getPublicUser, saveDemoProfile } = await import('../frontend/Scripts/userStore.js');
const { reviews } = await import('../frontend/Mocks/reviews.js');
const { getReviewsByUser, getReviewForUser, saveDemoReview } = await import('../frontend/Scripts/reviewStore.js');
assert.equal(users.length, 5);
assert.equal(games.length, 14);
assert.equal(reviews.length, 20);
assert.ok(users.every(user => !('password' in user) && !('email' in user) && !('token' in user)));
assert.ok(getPublicUser(DEMO_USER_ID));
assert.equal(getPublicUser('unknown'), null);
assert.equal(getReviewsByUser(DEMO_USER_ID).length, 4);
assert.equal(new Set(getReviewsByUser(DEMO_USER_ID).map(review => review.gameId)).size, 4);
assert.ok(getReviewsByUser('u-aria').length > 0);
const otherBefore = getPublicUser('u-aria');
assert.throws(() => saveDemoProfile({ displayName:'x', bio:'' }));
assert.throws(() => saveDemoProfile({ displayName:'Valid', bio:'b'.repeat(301) }));
const saved = saveDemoProfile({ displayName:'Sample Player', bio:'Loves RPGs and exploration.' });
assert.equal(saved.persisted,true);
assert.equal(getPublicUser(DEMO_USER_ID).displayName,'Sample Player');
assert.equal(getPublicUser(DEMO_USER_ID).bio,'Loves RPGs and exploration.');
assert.equal(getPublicUser('u-aria').displayName,otherBefore.displayName);
assert.deepEqual(Object.keys(JSON.parse(stored.get('gameaval.demo.profile.v1'))).sort(), ['bio','displayName']);
const existing = getReviewForUser('rdr2', DEMO_USER_ID);
assert.ok(existing);
assert.equal(saveDemoReview({ gameId:'rdr2', userId:DEMO_USER_ID, rating:4, title:'New perspective', body:'I still enjoy this adventure, but my rating has changed over time.' }).review.id,existing.id);
assert.equal(getReviewsByUser(DEMO_USER_ID).length,4, 'Editing does not duplicate reviews');
const pages = readdirSync(new URL('../frontend/Pages/',import.meta.url)).filter(file => file.endsWith('.html'));
for (const page of pages) {
  const html = readFileSync(new URL(`../frontend/Pages/${page}`,import.meta.url),'utf8');
  assert.match(html,/profilePage\.html/, `${page} must link to the demo profile`);
  if (page !== "authPage.html") assert.match(html,/type="module"/, `${page} must use native ES modules`);
}
const profile = readFileSync(new URL('../frontend/Pages/profilePage.html',import.meta.url),'utf8');
assert.match(profile,/id="profile-new-review"/);
assert.match(profile,/id="profile-game-select"/);
assert.match(profile,/id="profile-reviews-list"/);
assert.match(profile,/id="profile-not-found"/);
const account = readFileSync(new URL('../frontend/Pages/accountPage.html',import.meta.url),'utf8');
assert.match(account,/id="settings-display-name"/);
assert.match(account,/id="settings-bio"/);
assert.match(account,/Change password — backend required/);
assert.doesNotMatch(account,/<input[^>]+type="password"/);
const profileSource = readFileSync(new URL('../frontend/Scripts/profilePage.js',import.meta.url),'utf8');
assert.match(profileSource,/mountReviewModal/);
assert.match(profileSource,/createReviewCard/);
console.log('PASS: profile mock, 20 reviews, 4 demo reviews, account data isolation, edit and review upsert, 6 pages linked, same reusable modal.');
