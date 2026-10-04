import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
function worker() {
  const listeners = {};
  const writes = [];
  const context = {
    URL,
    self: { location: { origin: 'https://fourthcrown.example' }, addEventListener: (name, fn) => { listeners[name] = fn; } },
    caches: {
      match: async () => undefined,
      open: async () => ({ put: async (...args) => { writes.push(args); } }),
    },
    fetch: async () => ({ ok: true, status: 200, clone() { return this; } }),
  };
  vm.runInNewContext(source, context);
  return { listeners, writes };
}

for (const path of ['/api/verify-checkout-session?session_id=private', '/admin', '/admin/orders','/api/app?action=session','/checkout','/payment-success']) {
  test(`private request ${path} never enters a service-worker cache`, async () => {
    const { listeners, writes } = worker();
    let response;
    listeners.fetch({
      request: { method: 'GET', url: `https://fourthcrown.example${path}`, mode: 'navigate', destination: '' },
      respondWith: promise => { response = promise; },
    });
    if (response) await response;
    await Promise.resolve();
    assert.equal(writes.length, 0);
  });
}
