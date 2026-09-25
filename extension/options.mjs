import {labelPreferences, orderedLabels, normalize} from './core.mjs';
const $ = id => document.getElementById(id);
const manifest = chrome.runtime.getManifest();
const configured = !manifest.oauth2.client_id.startsWith('REPLACE_');
$('configuration').textContent = configured ? 'Connect the Gmail account signed in to this Chrome profile.' : 'This preview build is not connected to Google yet.';
$('connect').disabled = !configured;
let busy = false;
let ruleDirty = false;
let renderVersion = 0;
async function savePreferences(update) {
  const {labelSettings} = await chrome.storage.local.get('labelSettings');
  await chrome.storage.local.set({labelSettings: {...labelPreferences(labelSettings), ...update}});
}
async function render() {
  const version = ++renderVersion;
  const state = await chrome.storage.local.get(null);
  if (version !== renderVersion) return;
  const preferences = labelPreferences(state.labelSettings);
  $('count-mode').value = state.countMode || 'conversations';
  if (!busy) $('status').textContent = state.error || (state.snapshot ? `Connected: ${state.snapshot.email}. Counts updated ${new Date(state.snapshot.updatedAt).toLocaleTimeString()}.` : state.enabled ? 'Connected. Preparing inbox counts…' : 'Not connected.');
  $('disconnect').disabled = !state.enabled;
  $('rescan').disabled = !state.enabled;
  if (!ruleDirty) $('label-prefix').value = preferences.prefix;
  $('hide-empty').checked = preferences.hideEmpty;
  const list = $('labels'); list.replaceChildren();
  const rows = orderedLabels((state.snapshot?.rows || []).filter(row => !row.missing && normalize(row.name).startsWith(normalize(preferences.prefix))), preferences);
  const stale = !state.snapshot || !!state.error || Date.now() - state.snapshot.updatedAt > 150000;
  if (!rows.length) {
    const empty = document.createElement('p');
    empty.textContent = !state.enabled ? 'Connect Gmail to discover your labels.' : state.snapshot?.prefix !== preferences.prefix ? 'Looking for matching labels…' : 'No labels match this prefix. Try a different prefix.';
    list.append(empty);
  }
  for (const [index, row] of rows.entries()) {
    const div = document.createElement('div'); div.className = 'label-row';
    const selection = document.createElement('label'); selection.className = 'label-selection';
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = !preferences.excludedIds.includes(row.id);
    checkbox.setAttribute('aria-label', `Show ${row.name}`);
    checkbox.onchange = async () => {
      const {labelSettings} = await chrome.storage.local.get('labelSettings');
      const ids = new Set(labelPreferences(labelSettings).excludedIds);
      checkbox.checked ? ids.delete(row.id) : ids.add(row.id);
      await savePreferences({excludedIds: [...ids]});
    };
    const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = row.color;
    const text = document.createElement('span'); text.textContent = row.name;
    const count = document.createElement('span'); count.className = 'count';
    const mode = state.countMode || 'conversations';
    const format = value => !Number.isFinite(value) ? '—' : value.toLocaleString();
    count.textContent = `${format(row.unread?.[mode])} / ${format(row[mode])}`;
    count.title = stale ? `Last saved counts from ${new Date(state.snapshot.updatedAt).toLocaleString()}` : 'Unread / total inbox counts';
    selection.append(checkbox, dot, text); div.append(selection, count);
    for (const [offset, title, symbol] of [[-1, 'up', '↑'], [1, 'down', '↓']]) {
      const button = document.createElement('button'); button.className = 'secondary order-button'; button.textContent = symbol;
      button.setAttribute('aria-label', `Move ${row.name} ${title}`); button.disabled = index + offset < 0 || index + offset >= rows.length;
      button.onclick = async () => {
        const order = rows.map(item => item.id);
        [order[index], order[index + offset]] = [order[index + offset], order[index]];
        await savePreferences({order});
      };
      div.append(button);
    }
    list.append(div);
  }
}
$('label-prefix').oninput = () => {ruleDirty = true;};
$('label-rule').onsubmit = async event => {
  event.preventDefault();
  await savePreferences({prefix: $('label-prefix').value.trim()});
  ruleDirty = false;
  $('label-status').textContent = 'Prefix saved. Matching labels update on refresh.';
  await render();
};
$('hide-empty').onchange = () => savePreferences({hideEmpty: $('hide-empty').checked});
$('rescan').onclick = async () => {
  $('rescan').disabled = true; $('label-status').textContent = 'Refreshing labels and inbox counts…';
  try {
    const response = await chrome.runtime.sendMessage({type: 'rescan'});
    if (!response?.ok) throw new Error(response?.error || 'Refresh interrupted. Please retry.');
    $('label-status').textContent = 'Labels and counts refreshed.';
  } catch (error) { $('label-status').textContent = error.message; }
  finally { await render(); }
};
$('count-mode').onchange = () => chrome.storage.local.set({countMode: $('count-mode').value});
for (const type of ['connect', 'disconnect']) $(type).onclick = async () => {
  busy = true;
  $(type).disabled = true;
  $('status').textContent = type === 'connect' ? 'Connecting and counting inbox mail…' : 'Disconnecting…';
  try {
    const response = await chrome.runtime.sendMessage({type});
    if (!response?.ok) throw new Error(response?.error || 'Connection interrupted. Please retry.');
    busy = false; await render();
  } catch (error) { $('status').textContent = error.message; }
  finally {busy = false; $(type).disabled = type === 'connect' ? !configured : false;}
};
chrome.storage.onChanged.addListener(() => void render());
void render();
