import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

for (const base of ['../extension/']) {
  const source = readFileSync(new URL(base + 'content.js', import.meta.url), 'utf8');
  const tail = source.slice(source.indexOf('  function refreshVisible()'), source.lastIndexOf('})();'));
  const make = hidden => {
    const events = {}, timers = [], requests = [];
    const document = {hidden, addEventListener: (name, fn) => {events[name] = fn;}};
    vm.runInNewContext(tail, {document, window: {addEventListener: (name, fn) => {events[name] = fn;}},
      schedule() {}, send: type => requests.push(type), setInterval: (fn, ms) => timers.push({fn,ms})});
    return {document,events,timers,requests};
  };
  test(base + 'refreshes on visible open and each minute, pauses while hidden, resumes on return', () => {
    const state = make(false);
    assert.equal(state.requests.length,1);
    const tick = state.timers.find(t=>t.ms===60000).fn;
    tick(); assert.equal(state.requests.length,2);
    state.document.hidden=true;
    tick(); state.events.focus(); state.events.hashchange(); state.events.visibilitychange();
    assert.equal(state.requests.length,2);
    state.document.hidden=false;
    state.events.visibilitychange(); assert.equal(state.requests.length,3);
    state.events.focus(); assert.equal(state.requests.length,4);
    state.events.hashchange(); assert.equal(state.requests.length,5);
  });
  test(base + 'background-opened Gmail waits until visible', () => {
    const state = make(true);
    assert.equal(state.requests.length,0);
    state.document.hidden=false; state.events.visibilitychange();
    assert.equal(state.requests.length,1);
  });
  test(base + 'manifest and worker no longer depend on alarms', () => {
    const manifest = JSON.parse(readFileSync(new URL(base+'manifest.json',import.meta.url),'utf8'));
    assert.equal(manifest.permissions.includes('alarms'),false);
    const worker = readFileSync(new URL(base+'background.mjs',import.meta.url),'utf8');
    assert.equal(worker.includes('chrome.alarms'),false);
  });
}
