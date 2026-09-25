import {resolveLabels, countLabel, labelPreferences} from './core.mjs';
const API = 'https://gmail.googleapis.com/gmail/v1/users/me/';
let activeSync;
let syncRequested = false;
async function token(interactive = false) {
  if (chrome.runtime.getManifest().oauth2.client_id.startsWith('REPLACE_')) {
    throw new Error('Complete the Google connection setup in extension settings.');
  }
  const result = await chrome.identity.getAuthToken({interactive});
  if (!result.token) throw new Error('Connect Gmail in extension settings.');
  return result.token;
}
async function api(path, retry = 0) {
  const accessToken = await token();
  const response = await fetch(API + path, {
    headers: {Authorization: `Bearer ${accessToken}`}, signal: AbortSignal.timeout(20000)
  });
  if (response.status === 401 && retry === 0) {
    await chrome.identity.removeCachedAuthToken({token: accessToken});
    return api(path, 1);
  }
  if ((response.status === 429 || response.status >= 500) && retry < 3) {
    await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** retry));
    return api(path, retry + 1);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error?.message || `Gmail connection failed (${response.status}).`);
  }
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`Gmail returned ${body.length ? 'invalid' : 'empty'} data for ${path.split('?')[0]} (HTTP ${response.status}, ${response.headers.get('content-type') || 'no content type'}). Refresh to retry.`);
  }
}
async function syncNow() {
  const {enabled, labelSettings} = await chrome.storage.local.get(['enabled', 'labelSettings']);
  if (!enabled) return;
  const preferences = labelPreferences(labelSettings);
  try {
    const profile = await api('profile?fields=emailAddress');
    const {labels = []} = await api('labels?fields=labels(id,name,type)');
    const rows = resolveLabels(labels, preferences);
    // Keep concurrency low and publish a complete snapshot only after every page succeeds.
    for (let i = 0; i < rows.length; i += 3) {
      await Promise.all(rows.slice(i, i + 3).map(async row => {
        if (!row.missing) Object.assign(row, await countLabel(api, row.id));
      }));
    }
    // A disconnect during an in-flight request must not restore cached account data.
    const current = await chrome.storage.local.get(['enabled', 'labelSettings']);
    if (!current.enabled || labelPreferences(current.labelSettings).prefix !== preferences.prefix) return;
    await chrome.storage.local.set({snapshot: {email: profile.emailAddress, rows, prefix: preferences.prefix, updatedAt: Date.now()}, error: null});
  } catch (error) {
    if ((await chrome.storage.local.get('enabled')).enabled) {
      await chrome.storage.local.set({error: error.message});
    }
  }
}
function sync() {
  syncRequested = true;
  if (!activeSync) activeSync = (async () => {
    do { syncRequested = false; await syncNow(); } while (syncRequested);
  })().finally(() => {activeSync = null;});
  return activeSync;
}
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.labelSettings &&
      labelPreferences(changes.labelSettings.oldValue).prefix !== labelPreferences(changes.labelSettings.newValue).prefix) void sync();
});
chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (sender.id !== chrome.runtime.id) return;
  const optionsSender = sender.url === chrome.runtime.getURL('options.html');
  (async () => {
    if (message.type === 'settings') await chrome.runtime.openOptionsPage();
    else if (message.type === 'refresh') {
      const {lastRequested = 0} = await chrome.storage.local.get('lastRequested');
      if (Date.now() - lastRequested > 10000) {
        await chrome.storage.local.set({lastRequested: Date.now()});
        await sync();
      }
    } else if (message.type === 'rescan' && optionsSender) {
      await sync();
      const {error} = await chrome.storage.local.get('error');
      if (error) throw new Error(error);
    } else if (message.type === 'connect' && optionsSender) {
      await token(true);
      await chrome.storage.local.set({enabled: true, error: null});
      await sync();
      const {error} = await chrome.storage.local.get('error');
      if (error) throw new Error(error);
    } else if (message.type === 'disconnect' && optionsSender) {
      await chrome.storage.local.set({enabled: false});
      if (activeSync) await activeSync;
      await chrome.storage.local.clear();
      await chrome.identity.clearAllCachedAuthTokens();
    }
    return {ok: true};
  })().then(reply, error => reply({ok: false, error: error.message}));
  return true;
});
