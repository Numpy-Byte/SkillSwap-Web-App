const listingData = [
  { id: 'arduino', title: 'Arduino Uno Kit', category: 'Electronics', description: 'Starter kit with USB cable and basic components', credits: 15, kind: 'Asset', art: 'board', owner: 'Amina Rahman' },
  { id: 'calculator', title: 'Graphing Calculator', category: 'Mathematics', description: 'TI-84 Plus · ideal for calculus and statistics', credits: 10, kind: 'Asset', art: 'calculator', owner: 'Sam Lee' },
  { id: 'python', title: 'Python Programming Help', category: 'Computer science', description: 'One-to-one study session for your next project', credits: 20, kind: 'Skill', art: 'laptop', owner: 'Maya Patel' },
  { id: 'lab-tools', title: 'Lab Tools Set', category: 'Engineering', description: 'Calipers, ruler and safety glasses', credits: 12, kind: 'Asset', art: 'book', owner: 'Jordan Ali' },
  { id: 'sensor-pack', title: 'Arduino Sensor Pack', category: 'Electronics', description: 'Motion, light and distance sensors', credits: 8, kind: 'Asset', art: 'sensor', owner: 'Daniel Kim' },
  { id: 'microcontroller-help', title: 'Microcontroller Help', category: 'Computer science', description: 'Debugging and project guidance', credits: 18, kind: 'Skill', art: 'laptop', owner: 'Daniel Kim' },
];

const transactionData = [
  { title: 'Arduino Uno Kit', detail: 'Request sent · Owner: Daniel Kim', status: 'Pending', credits: '15 credits', art: 'board' },
  { title: 'Python programming help', detail: 'Study session · Owner: Maya Patel', status: 'Accepted', credits: '20 credits / session', art: 'laptop' },
  { title: 'Graphing Calculator', detail: 'Due back Oct 8 · Owner: Sam Lee', status: 'Borrowed', credits: '10 credits', art: 'calculator' },
  { title: 'Lab Tools Set', detail: 'Returned Oct 1 · Owner: Jordan Ali', status: 'Returned', credits: '12 credits', art: 'book' },
];

let currentBalance = 120;
let activeKind = 'all';
let toastTimer;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

function artMarkup(kind, large = false) {
  const className = ['asset-art', `art-${kind}`, large ? 'large-art' : ''].filter(Boolean).join(' ');
  return `<div class="${className}" aria-hidden="true">${kind === 'board' || kind === 'sensor' ? '<span class="board-chip"></span><span class="board-pin pin-a"></span><span class="board-pin pin-b"></span><span class="board-pin pin-c"></span><span class="board-pin pin-d"></span>' : ''}</div>`;
}

function statusClass(status) {
  return `status-badge ${String(status).toLowerCase()}`;
}

function listingCard(item) {
  const kindBadge = item.kind === 'Skill' ? 'skill-badge' : 'asset-badge';
  const creditLabel = item.kind === 'Skill' ? `${item.credits} credits / session` : `${item.credits} credits`;
  return `<article class="listing-card" data-kind="${escapeHtml(item.kind)}">
    <div class="listing-art">${artMarkup(item.art)}</div>
    <div class="listing-info">
      <div class="listing-topline"><span class="badge ${kindBadge}">${escapeHtml(item.kind)}</span></div>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="listing-description">${escapeHtml(item.category)} · ${escapeHtml(item.description)}</p>
      <div class="listing-bottom"><span class="verified-text">Campus verified · Near North Campus</span><span class="listing-credits">${creditLabel}<small>campus exchange</small></span></div>
      <button class="button secondary listing-view" data-item="${escapeHtml(item.id)}">View</button>
    </div>
  </article>`;
}

function resultRow(item) {
  const kindBadge = item.kind === 'Skill' ? 'skill-badge' : 'asset-badge';
  const value = item.kind === 'Skill' ? `${item.credits} credits / session` : `${item.credits} credits`;
  return `<article class="result-row"><div class="row-thumb">${artMarkup(item.art)}</div><div><span class="badge ${kindBadge}">${escapeHtml(item.kind)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.category)} · ${escapeHtml(item.description)}</p><small class="verified-text">Campus verified</small></div><strong class="result-value">${value}</strong><button class="button secondary listing-view" data-item="${escapeHtml(item.id)}">View</button></article>`;
}

function activityRow({ title, detail, status, art }) {
  return `<article class="activity-row"><div class="row-thumb">${artMarkup(art)}</div><div class="row-copy"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(detail)}</small></div><span class="badge ${statusClass(status)}">${escapeHtml(status)}</span><span></span><button class="row-chevron" data-go="requests" aria-label="Open requests">›</button></article>`;
}

function transactionRow(item) {
  return `<article class="transaction-row"><div class="row-thumb">${artMarkup(item.art)}</div><div class="transaction-copy"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></div><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span><strong class="row-value">${escapeHtml(item.credits)}<small>Exchange value</small></strong><button class="button secondary" data-go="transaction-details">Details</button></article>`;
}

function renderBrowse() {
  const filtered = listingData.filter((item) => activeKind === 'all' || item.kind === activeKind);
  $('#listing-grid').innerHTML = filtered.map(listingCard).join('');
}

function renderResults() {
  const query = ($('#results-search').value || '').trim().toLowerCase();
  const category = $('#category-filter').value;
  let results = listingData.filter((item) => {
    const matchesQuery = !query || `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(query);
    const matchesCategory = category === 'All categories' || item.category === category;
    return matchesQuery && matchesCategory;
  });
  const sort = $('#sort-select').value;
  if (sort === 'Credit: low to high') results = [...results].sort((a, b) => a.credits - b.credits);
  $('#results-count').textContent = `${results.length} result${results.length === 1 ? '' : 's'}${query ? ` for “${query}”` : ''}`;
  $('#results-list').innerHTML = results.length ? results.map(resultRow).join('') : '<div class="empty-state">No listings match those filters. Try broadening your search.</div>';
}

function renderRequests(status = 'All') {
  const filtered = status === 'All' ? transactionData : transactionData.filter((item) => item.status === status);
  $('#transaction-list').innerHTML = filtered.length ? filtered.map(transactionRow).join('') : '<div class="empty-state">There are no exchanges in this status yet.</div>';
}

function renderActivity() {
  $('#recent-activity').innerHTML = transactionData.slice(0, 3).map((item) => activityRow({
    title: item.title,
    detail: item.status === 'Pending' ? 'Request pending · Yesterday' : item.status === 'Accepted' ? 'Request accepted · 2 hours ago' : 'Item returned · 2 days ago',
    status: item.status,
    art: item.art,
  })).join('');
}

function updateBalance() {
  $('#header-credits').textContent = `${currentBalance} credits`;
  $('#dashboard-credits').textContent = String(currentBalance);
  $('#profile-credits').textContent = String(currentBalance);
  $('#profile-credit-card').textContent = String(currentBalance);
  $('#request-current-balance').textContent = `${currentBalance} credits`;
  $('#request-balance').textContent = `${Math.max(currentBalance - 15, 0)} credits`;
  $('#after-request-balance').textContent = String(Math.max(currentBalance - 15, 0));
}

function showScreen(id, { updateHash = true } = {}) {
  const screen = document.getElementById(id);
  if (!screen || !screen.classList.contains('screen')) return;
  $$('.screen').forEach((node) => node.classList.toggle('active', node === screen));
  const isLogin = id === 'login';
  $('#app-content').hidden = isLogin;
  document.body.classList.toggle('auth-mode', isLogin);
  $$('.nav-link').forEach((button) => button.classList.toggle('active', button.dataset.nav === id || (id === 'search-results' || id === 'item-details' || id === 'request-item') && button.dataset.nav === 'browse'));
  $('#page-counter').textContent = `${String([...$$('.screen')].indexOf(screen) + 1).padStart(2, '0')} / 10`;
  document.title = `SkillSwap | ${screen.dataset.title}`;
  $('.main-nav').classList.remove('open');
  $('.menu-toggle').setAttribute('aria-expanded', 'false');
  if (updateHash) history.replaceState(null, '', `#${id}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function notify(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

function openItem(id) {
  const item = listingData.find((entry) => entry.id === id);
  if (!item) return;
  const kind = item.kind.toLowerCase();
  $('#item-details').querySelector('.eyebrow').textContent = 'Marketplace listing';
  $('#item-details').querySelector('h1').textContent = item.title;
  $('#item-details').querySelector('.detail-card h2').textContent = item.title;
  $('#item-details').querySelector('.detail-card > .muted').textContent = `${item.category} · North Campus`;
  $('#item-details').querySelector('.detail-card .owner-row strong').textContent = item.owner;
  $('#item-details').querySelector('.detail-card h3 + p').textContent = item.description;
  $('#item-details').querySelector('.credit-value').textContent = item.kind === 'Skill' ? `${item.credits} credits / session` : `${item.credits} campus credits`;
  $('#item-details').querySelector('.detail-card .badge-row').innerHTML = `<span class="badge ${kind}-badge">${escapeHtml(item.kind)}</span><span class="badge verified-badge">Campus verified</span>`;
  const artSlot = $('#item-details .detail-artboard');
  artSlot.innerHTML = artMarkup(item.art, true);
  $('#request-item .requested-item strong').textContent = item.title;
  $('#request-item .requested-item small').textContent = `${item.credits} campus credits · ${item.kind}`;
  showScreen('item-details');
}

document.addEventListener('click', (event) => {
  const go = event.target.closest('[data-go]');
  if (go) { event.preventDefault(); showScreen(go.dataset.go); return; }
  const itemButton = event.target.closest('[data-item]');
  if (itemButton) { openItem(itemButton.dataset.item); return; }
  const kindButton = event.target.closest('[data-kind]');
  if (kindButton && kindButton.classList.contains('segment')) {
    activeKind = kindButton.dataset.kind;
    $$('.segment').forEach((button) => button.classList.toggle('selected', button === kindButton));
    renderBrowse();
    return;
  }
  const statusTab = event.target.closest('[data-status]');
  if (statusTab) {
    $$('.request-tab').forEach((button) => button.classList.toggle('selected', button === statusTab));
    renderRequests(statusTab.dataset.status);
    return;
  }
  const action = event.target.closest('[data-action]');
  if (action) {
    const messages = {
      message: 'Opening your conversation with Daniel Kim.',
      returned: 'Return update saved for this exchange.',
      report: 'Issue report form is ready for this transaction.',
      'edit-profile': 'Profile editing is ready.',
      'credit-history': 'Credit history will appear here.',
      settings: 'Account settings are ready.',
    };
    notify(messages[action.dataset.action] || 'Action saved.');
  }
});

$('#login-form').addEventListener('submit', (event) => { event.preventDefault(); showScreen('dashboard'); });
$('#auth-switch').addEventListener('click', () => {
  const signingUp = $('#auth-submit').textContent.startsWith('Create');
  $('#auth-heading').textContent = signingUp ? 'Welcome to SkillSwap' : 'Create your student account';
  $('#auth-subheading').textContent = signingUp ? 'Sign in with your university account to continue.' : 'Join your campus community with your university email.';
  $('#auth-submit').textContent = signingUp ? 'Log in to your account' : 'Create my account';
  $('#auth-switch-label').textContent = signingUp ? 'New to campus exchange?' : 'Already have an account?';
  $('#auth-switch').textContent = signingUp ? 'Create a student account' : 'Back to log in';
});
$('.menu-toggle').addEventListener('click', (event) => {
  const open = $('.main-nav').classList.toggle('open');
  event.currentTarget.setAttribute('aria-expanded', String(open));
});
$('#browse-search').addEventListener('keydown', (event) => { if (event.key === 'Enter') { $('#results-search').value = event.currentTarget.value; renderResults(); showScreen('search-results'); } });
$('#search-submit').addEventListener('click', renderResults);
$('.apply-filters').addEventListener('click', renderResults);
$('#sort-select').addEventListener('change', renderResults);
$('#request-form').addEventListener('submit', (event) => {
  event.preventDefault();
  transactionData.unshift({ title: $('#request-item .requested-item strong').textContent, detail: 'Request sent · Owner: Amina Rahman', status: 'Pending', credits: '15 credits', art: 'board' });
  renderRequests('All'); renderActivity(); showScreen('requests'); notify('Request sent. You can track its status here.');
});
$('#listing-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const title = String(form.get('title') || '').trim();
  if (!title) return;
  const id = `listing-${Date.now()}`;
  listingData.unshift({ id, title, category: String(form.get('category') || 'Campus'), description: String(form.get('description') || 'Shared with the campus community'), credits: Number(form.get('credits') || 10), kind: String(form.get('listing-type') || 'Asset'), art: 'book', owner: 'Amina Rahman' });
  renderBrowse(); renderResults(); event.currentTarget.reset(); showScreen('browse'); notify('Your listing is now published.');
});

renderBrowse();
renderResults();
renderRequests();
renderActivity();
updateBalance();
const initialScreen = location.hash.slice(1);
showScreen(document.getElementById(initialScreen)?.classList.contains('screen') ? initialScreen : 'login', { updateHash: false });
