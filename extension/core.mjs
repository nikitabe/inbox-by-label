// Preserve the original order and colors as defaults, not as a discovery list.
const LEGACY_STYLE = [
  ['Grok-Action', '#ffad47'], ['Grok-Can-Wait', '#fbd563'],
  ['Grok-Needs-Reply', '#ff5034'], ['Grok-News', '#2da2bb'],
  ['grok-p-ops', '#16a765'], ['grok-p-sales', '#2da2bb'],
  ['grok-p-support', '#4986e7'], ['Grok-Spam', '#8a210c'],
  ['Grok-To-Archive', '#666666']
];
export const normalize = name => name.replace(/^\s*•\s*/, '').trim().toLowerCase();
export const DEFAULT_PREFIX = '';
export function labelPreferences(value = {}) {
  return {prefix: typeof value.prefix === 'string' ? value.prefix.trim() : DEFAULT_PREFIX,
    excludedIds: Array.isArray(value.excludedIds) ? value.excludedIds : [],
    order: Array.isArray(value.order) ? value.order : [], hideEmpty: value.hideEmpty === true};
}
export function orderedLabels(rows, preferences = {}) {
  const {order} = labelPreferences(preferences);
  const rank = new Map(order.map((id, index) => [id, index]));
  return [...rows].sort((a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity));
}
export function resolveLabels(available, preferences = {}) {
  const {prefix} = labelPreferences(preferences);
  const styles = new Map(LEGACY_STYLE.map(([name, color], index) => [normalize(name), {color, index}]));
  const palette = ['#4986e7', '#16a765', '#2da2bb', '#b99aff', '#ffad47', '#f691b3'];
  const rows = available.filter(label => label.type === 'user' && normalize(label.name).startsWith(normalize(prefix)))
    .map(label => {
      const key = normalize(label.name);
      const hash = [...key].reduce((value, char) => (value * 31 + char.codePointAt(0)) >>> 0, 0);
      return {...label, color: styles.get(key)?.color || palette[hash % palette.length]};
    });
  rows.sort((a, b) => {
    const difference = (styles.get(normalize(a.name))?.index ?? Infinity) - (styles.get(normalize(b.name))?.index ?? Infinity);
    return difference || a.name.localeCompare(b.name, undefined, {sensitivity: 'base'}) || a.id.localeCompare(b.id);
  });
  return orderedLabels(rows, preferences);
}
export function searchQuery(name) {
  return `in:inbox label:"${name.toLowerCase().replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}
async function countSubset(api, id, unread = false) {
  const threads = new Set(), messages = new Set(), pages = new Set();
  let pageToken;
  do {
    // Keep the zero-result field: otherwise an empty list's field mask can
    // produce HTTP 204 with no JSON body instead of a usable empty page.
    const params = new URLSearchParams({maxResults: '500', includeSpamTrash: 'false', fields: 'messages(id,threadId),nextPageToken,resultSizeEstimate'});
    params.append('labelIds', 'INBOX');
    params.append('labelIds', id);
    if (unread) params.append('labelIds', 'UNREAD');
    if (pageToken) params.set('pageToken', pageToken);
    const page = await api(`messages?${params}`);
    for (const message of page.messages || []) {
      if (!message.id || !message.threadId) throw new Error('Gmail returned incomplete count data. Refresh to retry.');
      messages.add(message.id);
      threads.add(message.threadId);
    }
    pageToken = page.nextPageToken;
    if (pageToken && pages.has(pageToken)) throw new Error('Gmail repeated a page. Refresh to retry.');
    if (pageToken) pages.add(pageToken);
  } while (pageToken);
  return {conversations: threads.size, messages: messages.size};
}

export async function countLabel(api, id) {
  const total = await countSubset(api, id);
  const unread = total.messages === 0 ? {messages: 0, conversations: 0} : await countSubset(api, id, true);
  return {...total, unread};
}
