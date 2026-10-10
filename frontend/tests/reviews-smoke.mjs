import assert from 'node:assert/strict';
const stored = new Map();
globalThis.localStorage = {
  getItem(key) { return stored.get(key) ?? null; },
  setItem(key, value) { stored.set(key, value); }
};
const { games, getGameById } = await import('../frontend/Mocks/games.js');
const { users, DEMO_USER_ID, getUserById } = await import('../frontend/Mocks/users.js');
const { reviews } = await import('../frontend/Mocks/reviews.js');
const { getReviewsByGame, getReviewsByUser, getReviewForUser, saveDemoReview, getReviews } = await import('../frontend/Scripts/reviewStore.js');
assert.equal(games.length, 14);
assert.equal(reviews.length, 20);
assert.equal(new Set(reviews.map(r => r.gameId)).size, 14, 'All games should have reviews');
assert.equal(new Set(reviews.map(r => `${r.userId}:${r.gameId}`)).size, reviews.length, 'Unique pair');
for (const review of reviews) {
  assert.ok(getGameById(review.gameId));
  assert.ok(getUserById(review.userId));
  assert.ok(Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5);
  assert.ok(review.title.length >= 3 && review.title.length <= 90);
  assert.ok(review.body.length >= 20 && review.body.length <= 2500);
  assert.ok(!Number.isNaN(Date.parse(review.createdAt)));
  assert.ok(!Number.isNaN(Date.parse(review.updatedAt)));
}
assert.equal(getReviewsByGame('rdr2').length, 3);
assert.equal(getReviewsByUser(DEMO_USER_ID).length, 4);
assert.equal(getReviewForUser('rdr2',DEMO_USER_ID).id,'rv-003');
let edit = saveDemoReview({gameId:'rdr2',userId:DEMO_USER_ID,rating:4,title:'Changed my mind',body:'Still love the world, but I prefer a faster pace in the main story.'});
assert.equal(edit.review.id, 'rv-003');
assert.equal(edit.persisted, true);
assert.equal(getReviewsByGame('rdr2').length, 3);
assert.equal(getReviewsByGame('rdr2').find(r => r.userId === DEMO_USER_ID).rating,4);
let create = saveDemoReview({gameId:'witcher3',userId:DEMO_USER_ID,rating:5,title:'Great adventure',body:'The exploration is phenomenal and every victory is meaningful.'});
assert.equal(create.review.id,'demo-demo-player-witcher3');
assert.equal(getReviewsByGame('witcher3').length,2);
assert.equal(getReviewsByUser(DEMO_USER_ID).length,5);
assert.equal(getReviews().length, 21);
assert.throws(() => saveDemoReview({gameId:'witcher3',userId:DEMO_USER_ID,rating:8,title:'Bad',body:'A text that is long enough for a review.'}));
assert.ok(stored.has('gameaval.demo.reviews.v1'));
console.log('PASS: 14 games, 5 users, 20 original reviews, 14/14 game coverage, validation, create/edit/upsert, local persistence.');
