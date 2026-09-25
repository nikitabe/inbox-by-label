import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {labelPreferences} from '../extension/core.mjs';
const source = readFileSync(new URL('../extension/content.js', import.meta.url), 'utf8');
const code = source.slice(source.indexOf('  function hasUnread('), source.indexOf('  function render()'));
const {showRow, formatCount} = vm.runInNewContext(`${code}; ({showRow, formatCount});`);
test('saved values remain visible and missing values never become zero', () => {
  assert.equal(formatCount(24),'24'); assert.equal(formatCount(0),'0');
  assert.equal(formatCount(undefined),'—'); assert.equal(formatCount(NaN),'—');
});
test('hide-empty uses total inbox mail, not unread count', () => {
  assert.equal(showRow({conversations:24,unread:{conversations:0}},'conversations',true),true);
  assert.equal(showRow({conversations:0},'conversations',true),false);
  assert.equal(showRow({messages:0},'messages',true),false);
  assert.equal(showRow({},'conversations',true),true);
  assert.equal(showRow({conversations:0},'conversations',false),true);
});
test('hide-empty defaults on while honoring an explicit preference', () => {
  assert.equal(labelPreferences().hideEmpty,true);
  assert.equal(labelPreferences({hideEmpty:false}).hideEmpty,false);
});
