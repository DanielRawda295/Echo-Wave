const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const ts = require('typescript');
const packageRequire = createRequire(path.resolve(__dirname, '../package.json'));
const token = id => `header.${Buffer.from(JSON.stringify({ sub: id })).toString('base64url')}.signature`;

function memoryStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}

function loadStores(localStorage, sessionStorage = memoryStorage()) {
  const cache = new Map();
  function load(file) {
    const filename = path.resolve(__dirname, '../src', file);
    if (cache.has(filename)) return cache.get(filename);
    const exports = {};
    cache.set(filename, exports);
    const requireModule = name => name.startsWith('.')
      ? load(path.relative(path.resolve(__dirname, '../src'), path.resolve(path.dirname(filename), name + '.ts')))
      : packageRequire(name);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText, { exports, require: requireModule, localStorage, sessionStorage, console, Date }, { filename });
    return exports;
  }
  return { ...load('hooks/useFavorites.ts'), ...load('hooks/useRecentlyPlayed.ts'), ...load('utils/accountLibrary.ts') };
}

const song = { key: 'qa-song', title: 'QA song' };

test('logout hides lists, re-login restores them, and another account stays isolated', () => {
  const storage = memoryStorage();
  storage.setItem('token', token(7));
  const stores = loadStores(storage);
  stores.useFavorites.getState().toggleFavorite(song);
  stores.useRecentlyPlayed.getState().add(song);
  stores.selectFavoritesAccount(null);
  stores.selectRecentlyPlayedAccount(null);
  assert.equal(stores.useFavorites.getState().favorites.length, 0);
  assert.equal(stores.useRecentlyPlayed.getState().items.length, 0);
  stores.selectFavoritesAccount('8');
  stores.selectRecentlyPlayedAccount('8');
  assert.equal(stores.useFavorites.getState().favorites.length, 0);
  assert.equal(stores.useRecentlyPlayed.getState().items.length, 0);
  stores.useFavorites.getState().toggleFavorite({ key: 'other-account-song' });
  stores.selectFavoritesAccount('7');
  stores.selectRecentlyPlayedAccount('7');
  assert.equal(stores.useFavorites.getState().favorites[0].id, 'qa-song');
  assert.equal(stores.useRecentlyPlayed.getState().items[0].id, 'qa-song');
  const reloaded = loadStores(storage);
  assert.equal(reloaded.useFavorites.getState().favorites[0].id, 'qa-song');
  assert.equal(reloaded.useRecentlyPlayed.getState().items[0].id, 'qa-song');
});

test('explicit clearing persists only for the selected account', () => {
  const storage = memoryStorage();
  storage.setItem('token', token(7));
  const stores = loadStores(storage);
  stores.useFavorites.getState().toggleFavorite(song);
  stores.useRecentlyPlayed.getState().add(song);
  stores.selectFavoritesAccount('8');
  stores.selectRecentlyPlayedAccount('8');
  stores.useFavorites.getState().clearFavorites();
  stores.useRecentlyPlayed.getState().clear();
  stores.selectFavoritesAccount('7');
  stores.selectRecentlyPlayedAccount('7');
  assert.equal(stores.useFavorites.getState().favorites.length, 1);
  assert.equal(stores.useRecentlyPlayed.getState().items.length, 1);
  stores.useFavorites.getState().clearFavorites();
  stores.useRecentlyPlayed.getState().clear();
  const reloaded = loadStores(storage);
  assert.equal(reloaded.useFavorites.getState().favorites.length, 0);
  assert.equal(reloaded.useRecentlyPlayed.getState().items.length, 0);
});

test('upgrading retains the already signed-in account library without sharing it', () => {
  const storage = memoryStorage();
  storage.setItem('token', token(7));
  storage.setItem('echowave.favorites.v1', JSON.stringify({ state: { favorites: [{ id: 'old', song }] }, version: 0 }));
  storage.setItem('echowave.recentlyPlayed.v1', JSON.stringify({ state: { items: [{ id: 'old', song }] }, version: 0 }));
  const stores = loadStores(storage);
  assert.equal(stores.useFavorites.getState().favorites[0].id, 'old');
  assert.equal(stores.useRecentlyPlayed.getState().items[0].id, 'old');
  stores.selectFavoritesAccount('8');
  stores.selectRecentlyPlayedAccount('8');
  assert.equal(stores.useFavorites.getState().favorites.length, 0);
  assert.equal(stores.useRecentlyPlayed.getState().items.length, 0);
  assert.equal(storage.getItem('echowave.favorites.v1'), null);
});

test('a corrupt record for another account cannot retain the previous account in memory', () => {
  const storage = memoryStorage();
  storage.setItem('token', token(7));
  const stores = loadStores(storage);
  stores.useFavorites.getState().toggleFavorite(song);
  storage.setItem('echowave.favorites.v2:8', '{broken');
  stores.selectFavoritesAccount('8');
  assert.equal(stores.useFavorites.getState().favorites.length, 0);
});

test('deactivation removes only that account library', () => {
  const storage = memoryStorage();
  storage.setItem('token', token(7));
  const stores = loadStores(storage);
  stores.useFavorites.getState().toggleFavorite(song);
  stores.useRecentlyPlayed.getState().add(song);
  stores.selectFavoritesAccount('8');
  stores.useFavorites.getState().toggleFavorite({ key: 'other' });
  stores.forgetAccountLibrary('7');
  stores.selectFavoritesAccount('7');
  stores.selectRecentlyPlayedAccount('7');
  assert.equal(stores.useFavorites.getState().favorites.length, 0);
  assert.equal(stores.useRecentlyPlayed.getState().items.length, 0);
  stores.selectFavoritesAccount('8');
  assert.equal(stores.useFavorites.getState().favorites[0].id, 'other');
});
