import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../extension/content.js', import.meta.url), 'utf8');
const helper = source.slice(source.indexOf('  const send ='), source.indexOf('  function accountEmail'));
const sender = runtime => vm.runInNewContext(`${helper}\nsend;`, {chrome: {runtime}});

test('handles a synchronous extension-context invalidation', async () => {
  const send = sender({id:'test',sendMessage(){throw new Error('Extension context invalidated.');}});
  assert.equal(await send('refresh'),undefined);
});
test('handles a rejected message Promise', async () => {
  const send = sender({id:'test',sendMessage:() => Promise.reject(new Error('No receiving end'))});
  assert.equal(await send('refresh'),undefined);
});
test('does not send after runtime loses its extension ID', async () => {
  let called = false;
  const send = sender({sendMessage(){called = true;}});
  assert.equal(await send('refresh'),undefined);
  assert.equal(called,false);
});
test('forwards normal messages and returns their response', async () => {
  let type;
  const send = sender({id:'test',sendMessage:async message => {type=message.type; return 'ok';}});
  assert.equal(await send('settings'),'ok');
  assert.equal(type,'settings');
});
