(() => {
  const ID = 'inbox-by-label';
  const normalize = text => text.replace(/^\s*•\s*/, '').trim().toLowerCase();
  let state = {}, host, signature, scheduled;
  const send = async type => {
    try {
      if (!chrome.runtime?.id) return;
      return await chrome.runtime.sendMessage({type});
    } catch {
      // Reloading the extension invalidates scripts in already-open Gmail tabs.
      // sendMessage can throw before it returns a Promise, so catch both forms.
      // Refreshing Gmail attaches this tab to the current extension again.
    }
  };
  function accountEmail() {
    // Read only the visible account control, never Gmail's internal application state.
    const controls = [...document.querySelectorAll('a[aria-label],button[aria-label]')];
    const account = controls.find(e => /Google Account:/i.test(e.getAttribute('aria-label') || ''));
    const match = account?.getAttribute('aria-label').match(/\(([^()\s]+@[^()\s]+)\)/);
    return match?.[1]?.toLowerCase();
  }
  function create(tag, text, cls) {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (cls) element.className = cls;
    return element;
  }
  function hasUnread(row, mode, stale) {
    return !stale && Number.isFinite(row.unread?.[mode]) && row.unread[mode] > 0;
  }
  function unreadFirst(rows, mode, stale) {
    // Stable sort preserves the user's order within the unread and read groups.
    return [...rows].sort((a, b) => Number(hasUnread(b, mode, stale)) - Number(hasUnread(a, mode, stale)));
  }
  function render() {
    // Gmail owns every child in its native label lists. Mount alongside the
    // entire navigation tree, never among .TK/.aim/.TO rows: Gmail reconciles
    // those rows by position and an injected sibling can cause duplicates.
    const nativeSidebar = document.querySelector('.nM');
    if (!nativeSidebar?.parentElement) return;
    const preferences = state.labelSettings || {};
    const prefix = preferences.prefix ?? '';
    const snapshot = state.snapshot;
    const order = new Map((preferences.order || []).map((id, index) => [id, index]));
    const selected = (snapshot?.rows || []).filter(row => !row.missing &&
      normalize(row.name).startsWith(normalize(prefix)) && !(preferences.excludedIds || []).includes(row.id))
      .sort((a, b) => (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity));
    if (!host?.isConnected) {
      host = create('section'); host.id = ID;
      host.dataset.iblVersion = '0.2.1';
      signature = null;
    }
    if (host.parentElement !== nativeSidebar.parentElement || host.nextElementSibling !== nativeSidebar) {
      nativeSidebar.before(host);
    }
    const email = accountEmail();
    const matched = !!(state.enabled && email && snapshot?.email.toLowerCase() === email);
    const stale = !snapshot || Date.now() - snapshot.updatedAt > 150000 || !!state.error;
    const key = JSON.stringify([email, state, location.hash, stale]);
    if (key === signature) return;
    signature = key;
    const heading = create('div', null, 'ibl-heading');
    heading.append(create('strong', 'Inbox by label'));
    const settings = create('button', '⚙', 'ibl-button');
    settings.title = 'Inbox by label settings'; settings.setAttribute('aria-label', settings.title);
    settings.onclick = () => send('settings'); heading.append(settings);
    host.replaceChildren(heading);
    if (!matched) {
      const text = !state.enabled ? 'Connect Gmail to show inbox counts.' : !email ? 'Open Gmail in English to verify this account.' : snapshot ? `Connected to ${snapshot.email}. Open that Gmail account.` : 'Preparing counts. Check settings for connection status.';
      host.append(create('p', text, 'ibl-status'));
      const button = create('button', 'Set up', 'ibl-button'); button.onclick = () => send('settings'); host.append(button);
      return;
    }
    const mode = state.countMode || 'conversations';
    const visible = unreadFirst(selected, mode, stale).filter(row => !preferences.hideEmpty || stale || row[mode] !== 0);
    if (!visible.length) host.append(create('p', selected.length ? 'No matching labels have inbox mail.' : 'No labels selected. Change the prefix or selections in settings.', 'ibl-status'));
    for (const row of visible) {
      const link = create('a', null, 'ibl-row');
      if (hasUnread(row, mode, stale)) link.classList.add('ibl-unread');
      const query = `in:inbox label:"${row.name.toLowerCase().replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      const searchHash = '#search/' + encodeURIComponent(query);
      link.href = location.pathname + searchHash;
      link.addEventListener('click', event => {
        // Gmail handles sidebar clicks itself and can cancel a plain anchor.
        // Navigate explicitly before the event reaches its delegated handlers.
        event.stopPropagation();
        if (row.missing) { event.preventDefault(); return; }
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        location.hash = searchHash;
      });
      const tag = create('span', null, 'ibl-tag'); tag.style.background = row.color;
      const name = create('span', row.name, 'ibl-name');
      const total = row[mode], unread = row.unread?.[mode];
      const format = value => row.missing || stale || !Number.isFinite(value) ? '—' : value.toLocaleString();
      const count = create('span', `${format(unread)} / ${format(total)}`, 'ibl-count');
      link.title = row.missing ? 'Label not found' : stale ? 'Counts need refreshing' : !Number.isFinite(unread) ? 'Unread count is loading; unread / total inbox counts' : `${unread} unread / ${total} total inbox ${mode}`;
      link.setAttribute('aria-label', `${row.name}: ${link.title}`);
      if (row.missing) { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); }
      if (location.hash === new URL(link.href || location.href).hash && !row.missing) link.setAttribute('aria-current', 'page');
      link.append(tag, name, count); host.append(link);
    }
    const footer = create('div', null, 'ibl-footer');
    const status = create('span', state.error ? 'Refresh failed' : stale ? 'Counts out of date' : `Unread / total · ${mode}`, 'ibl-status');
    status.title = state.error || `Updated ${new Date(snapshot.updatedAt).toLocaleTimeString()}`;
    const refresh = create('button', '↻', 'ibl-button'); refresh.title = 'Refresh inbox counts'; refresh.setAttribute('aria-label', refresh.title);
    refresh.onclick = async () => { refresh.disabled = true; await send('refresh'); refresh.disabled = false; };
    footer.append(status, refresh); host.append(footer);
  }
  function schedule() {
    if (!scheduled) scheduled = setTimeout(() => {scheduled = null; render();}, 250);
  }
  chrome.storage.local.get(null).then(data => {state = data; render();});
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    for (const [key, value] of Object.entries(changes)) state[key] = value.newValue;
    schedule();
  });
  new MutationObserver(mutations => {
    if (mutations.some(m => !host?.contains(m.target) && m.target !== host)) schedule();
  }).observe(document.documentElement, {subtree: true, childList: true});
  window.addEventListener('hashchange', () => {schedule(); void send('refresh');});
  window.addEventListener('focus', () => {schedule(); void send('refresh');});
  document.addEventListener('visibilitychange', () => {if (!document.hidden) {schedule(); void send('refresh');}});
  setInterval(schedule, 30000);
  void send('refresh');
})();
