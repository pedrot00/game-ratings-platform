import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
// Funciona tanto em tests/ na raiz do repo quanto em frontend/tests/.
const root = existsSync(new URL('../frontend/Mocks/', import.meta.url)) ? '../frontend/' : '../';
const load = path => import(new URL(root + path, import.meta.url).href);
const read = path => readFileSync(new URL(root + path, import.meta.url), 'utf8');
const stored = new Map();
globalThis.localStorage = {
  getItem(key) { return stored.get(key) ?? null; },
  setItem(key, value) { stored.set(key, value); }
};
const { DEMO_USER_ID } = await load('Mocks/users.js');
const { gameLog } = await load('Mocks/gameLog.js');
const { GAME_LOG_STATUSES, getGameLog, getLogByUser, getLogEntry, setGameStatus } = await load('Scripts/gameLogStore.js');

assert.deepEqual(GAME_LOG_STATUSES.map(status => status.id), ['played', 'playing', 'planned']);
assert.equal(getGameLog().length, gameLog.length);
assert.equal(new Set(gameLog.map(item => `${item.userId}:${item.gameId}`)).size, gameLog.length, 'One status per user and game');
assert.equal(getLogByUser(DEMO_USER_ID).length, 7);

const before = getLogByUser('u-aria').length;
assert.equal(getLogEntry('zelda', DEMO_USER_ID).status, 'planned');
const saved = setGameStatus({ gameId: 'zelda', userId: DEMO_USER_ID, status: 'playing' });
assert.equal(saved.persisted, true);
assert.equal(getLogEntry('zelda', DEMO_USER_ID).status, 'playing');
assert.equal(getLogByUser(DEMO_USER_ID).length, 7, 'Changing status does not duplicate entries');
assert.equal(getLogByUser('u-aria').length, before, 'Other users are untouched');

assert.equal(setGameStatus({ gameId: 'zelda', userId: DEMO_USER_ID, status: null }).entry, null);
assert.equal(getLogEntry('zelda', DEMO_USER_ID), null);
assert.equal(setGameStatus({ gameId: 'rdr2', userId: DEMO_USER_ID, status: '' }).entry, null, 'Mock entries can be removed');
assert.equal(getLogEntry('rdr2', DEMO_USER_ID), null);
assert.throws(() => setGameStatus({ gameId: 'zelda', userId: DEMO_USER_ID, status: 'finished' }));
assert.throws(() => setGameStatus({ gameId: 'unknown', userId: DEMO_USER_ID, status: 'played' }));

const game = read('Pages/gamePage.html');
assert.match(game, /id="game-log-options"/);
assert.match(game, /id="game-log-hint"/);
assert.match(game, /gameLog\.css/);
const profile = read('Pages/profilePage.html');
assert.match(profile, /id="profile-log-tabs"/);
assert.match(profile, /id="profile-log-grid"/);
assert.match(profile, /id="profile-log-empty"/);
assert.match(profile, /gameLog\.css/);
console.log('gamelog-smoke: ok');
