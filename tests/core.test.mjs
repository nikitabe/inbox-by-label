import test from 'node:test';
import assert from 'node:assert/strict';
import {countLabel, resolveLabels, searchQuery, orderedLabels, labelPreferences} from '../extension/core.mjs';

test('counts every page, deduplicates conversations, counts total and unread inbox mail separately', async () => {
  const requests = [];
  const api = async path => {
    const query = new URL('https://example.test/' + path).searchParams;
    requests.push(query);
    const unread = query.getAll('labelIds').includes('UNREAD');
    assert.deepEqual(query.getAll('labelIds'), unread ? ['INBOX','Label_123','UNREAD'] : ['INBOX','Label_123']);
    if (unread) return query.has('pageToken') ? {messages:[{id:'m2',threadId:'t1'}]} : {messages:[{id:'m1',threadId:'t1'},{id:'m2',threadId:'t1'}],nextPageToken:'unread-next'};
    assert.equal(query.has('q'), false);
    return query.has('pageToken') ? {messages:[{id:'m2',threadId:'t1'},{id:'m3',threadId:'t2'}]} : {messages:[{id:'m1',threadId:'t1'},{id:'m2',threadId:'t1'}],nextPageToken:'next',resultSizeEstimate:5000};
  };
  assert.deepEqual(await countLabel(api,'Label_123'),{messages:3,conversations:2,unread:{messages:2,conversations:1}});
  assert.equal(requests.length,4);
});
test('empty inbox produces a real zero', async () => {
  // Reproduce Gmail's empty-result behavior under a partial-response mask.
  // Without resultSizeEstimate, no selected fields remain and Gmail returns 204.
  const api = async path => {
    const fields = new URL('https://example.test/' + path).searchParams.get('fields').split(',');
    const body = fields.includes('resultSizeEstimate') ? '{"resultSizeEstimate":0}' : '';
    return JSON.parse(body);
  };
  assert.deepEqual(await countLabel(api,'label'),{messages:0,conversations:0,unread:{messages:0,conversations:0}});
});
test('failed later page rejects partial count', async () => {
  let call = 0;
  await assert.rejects(countLabel(async () => {if (call++) throw new Error('offline'); return {messages:[{id:'a',threadId:'a'}],nextPageToken:'n'};}, 'x'),/offline/);
});
test('repeated page token is rejected', async () => {
  await assert.rejects(countLabel(async () => ({nextPageToken:'repeat'}),'x'),/repeated/);
});
test('discovers only existing matching labels and preserves exact punctuation', () => {
  const rows = resolveLabels([{id:'a',name:'• Grok-Action',type:'user'}]);
  assert.equal(rows[0].name,'• Grok-Action');
  assert.equal(rows[0].id,'a');
  assert.equal(rows.length,1);
  assert.equal(searchQuery(rows[0].name),'in:inbox label:"• grok-action"');
});
test('new labels are discovered by prefix, including Review; system and unrelated labels are excluded', () => {
  const available = [
    {id:'review',name:'Grok-Review',type:'user'},
    {id:'new',name:' • gRoK-New',type:'user'},
    {id:'action',name:'• Grok-Action',type:'user'},
    {id:'other',name:'Other-Grok-Label',type:'user'},
    {id:'system',name:'Grok-System',type:'system'}
  ];
  assert.deepEqual(resolveLabels(available,{prefix:'Grok-'}).map(row => row.id), ['action','new','review']);
  assert.deepEqual(resolveLabels(available, {prefix:'Other-'}).map(row => row.id), ['other']);
  assert.equal(resolveLabels(available, {prefix:''}).length,4);
  assert.equal(resolveLabels(available.filter(row => row.id !== 'review'),{prefix:'Grok-'}).some(row => row.id === 'review'), false);
});
test('custom order follows stable IDs after renaming; newly discovered labels are appended', () => {
  const rows = resolveLabels([
    {id:'a',name:'Grok-Action',type:'user'},
    {id:'b',name:'Grok-Renamed',type:'user'},
    {id:'c',name:'Grok-New',type:'user'}
  ], {order:['deleted','b','a']});
  assert.deepEqual(rows.map(row => row.id),['b','a','c']);
  assert.deepEqual(orderedLabels(rows,{order:['a','b']}).map(row=>row.id),['a','b','c']);
  assert.equal(labelPreferences().prefix,'');
  assert.equal(labelPreferences().hideEmpty,false);
});

test('all read inbox mail has zero unread and retains its total', async () => {
  const api = async path => new URL('https://example.test/' + path).searchParams.getAll('labelIds').includes('UNREAD')
    ? {} : {messages:[{id:'a',threadId:'t'}]};
  assert.deepEqual(await countLabel(api,'x'), {messages:1,conversations:1,unread:{messages:0,conversations:0}});
});
test('unread request failure rejects the snapshot instead of showing zero', async () => {
  const api = async path => {
    if (new URL('https://example.test/' + path).searchParams.getAll('labelIds').includes('UNREAD')) throw new Error('offline');
    return {messages:[{id:'a',threadId:'t'}]};
  };
  await assert.rejects(countLabel(api,'x'), /offline/);
});

test('public defaults include all custom labels but no system labels', () => {
  assert.deepEqual(resolveLabels([{id:'a',name:'Action',type:'user'}, {id:'b',name:'News',type:'user'}, {id:'inbox',name:'INBOX',type:'system'}]).map(r => r.id), ['a','b']);
});
