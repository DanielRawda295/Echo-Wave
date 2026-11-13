const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function setup(fragment) {
  const stored = new Map();
  const sessionStorage = {
    getItem: key => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, value),
    removeItem: key => stored.delete(key),
  };
  const history = { replaceState: (...args) => { history.last = args; } };
  const context = {
    exports: {}, URLSearchParams, Date, sessionStorage,
    window: { location: { hash: fragment, search: '', pathname: '/auth/google/callback' }, history },
  };
  const source = readFileSync(join(__dirname, '../src/utils/googleOAuth.ts'), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, context);
  return { ...context.exports, history };
}

const attempt = () => ({ challengeId: 'challenge', nonce: 'nonce', state: 'expected', expiresAt: Date.now() + 60000, persist: false, next: '/' });

test('a matching callback is accepted once and credentials are removed from the URL', () => {
  const oauth = setup('#id_token=test-token&state=expected');
  oauth.saveGoogleAttempt(attempt());
  assert.equal(oauth.consumeGoogleCallback().token, 'test-token');
  assert.equal(oauth.history.last[2], '/auth/google/callback');
  assert.throws(() => oauth.consumeGoogleCallback(), /not started/);
});

test('callbacks from another browser session or with a mismatched state are rejected', () => {
  const oauth = setup('#id_token=test-token&state=wrong');
  assert.throws(() => oauth.consumeGoogleCallback(), /not started/);
  oauth.saveGoogleAttempt(attempt());
  assert.throws(() => oauth.consumeGoogleCallback(), /could not be verified/);
});

test('expired attempts and Google rejection responses are rejected', () => {
  const expired = setup('#id_token=test-token&state=expected');
  expired.saveGoogleAttempt({ ...attempt(), expiresAt: Date.now() - 1 });
  assert.throws(() => expired.consumeGoogleCallback(), /expired/);
  const denied = setup('#error=access_denied&state=expected');
  denied.saveGoogleAttempt(attempt());
  assert.throws(() => denied.consumeGoogleCallback(), /cancelled or rejected/);
});
