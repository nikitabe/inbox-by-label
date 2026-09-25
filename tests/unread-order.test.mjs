import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source = readFileSync(new URL('../extension/content.js', import.meta.url), 'utf8');
const code = source.slice(source.indexOf('  function hasUnread('), source.indexOf('  function render()'));
const {hasUnread, unreadFirst} = vm.runInNewContext(`${code}; ({hasUnread, unreadFirst});`);
const rows = [
  {id:'read', unread:{conversations:0,messages:0}},
  {id:'few', unread:{conversations:1,messages:2}},
  {id:'unknown'},
  {id:'many', unread:{conversations:8,messages:12}}
];
test('unread labels move first, keeping custom order within both groups', () => {
  for (const mode of ['messages','conversations']) {
    assert.deepEqual(Array.from(unreadFirst(rows,mode,false),r=>r.id), ['few','many','read','unknown']);
    assert.equal(hasUnread(rows[1],mode,false),true);
    assert.equal(hasUnread(rows[0],mode,false),false);
    assert.equal(hasUnread(rows[2],mode,false),false);
  }
  assert.deepEqual(rows.map(r=>r.id),['read','few','unknown','many']);
});
test('saved counts preserve unread grouping while refreshing', () => {
  assert.deepEqual(Array.from(unreadFirst(rows,'conversations',true),r=>r.id),['few','many','read','unknown']);
  assert.equal(hasUnread(rows[1],'conversations',true),true);
});
test('reading the last unread message returns its label to the read group', () => {
  const updated = rows.map(r=>r.id==='few'?{...r,unread:{conversations:0,messages:0}}:r);
  assert.deepEqual(Array.from(unreadFirst(updated,'messages',false),r=>r.id),['many','read','few','unknown']);
});
