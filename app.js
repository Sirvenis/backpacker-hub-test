const libraryItems = [
  {
    title: 'Backpacker WageCheck',
    label: 'Free + full pass',
    labelClass: 'free',
    description: 'Check pay, tax, super, piece rates, payslips, and 88-day proof without needing a payroll degree.',
    tags: ['Pay check', '88 days', 'Work proof'],
    href: 'https://backpacker.wagecheckapp.com.au/'
  },
  {
    title: 'Free This Month',
    label: 'Free rotation',
    labelClass: 'free',
    description: 'A changing monthly pick: one game, one story, and one useful tool so free visitors always get something real.',
    tags: ['Game', 'Story', 'Tool'],
    href: '#free'
  },
  {
    title: 'Games Library',
    label: 'Full pass',
    labelClass: 'full',
    description: 'Small browser games for hostel downtime, wet days, quiet nights, and long waits between shifts.',
    tags: ['Mystery', 'Puzzle', 'Arcade'],
    href: './games/'
  },
  {
    title: 'Stories & Novels',
    label: 'Full pass',
    labelClass: 'full',
    description: 'Readable stories and serial novels that give backpackers something free or cheap to enjoy while travelling.',
    tags: ['Short reads', 'Serials', 'Travel downtime'],
    href: '#pass'
  },
  {
    title: 'Useful Tools',
    label: 'Mixed access',
    labelClass: 'locked',
    description: 'Budget helpers, work checklists, payslip red flags, day-count proof, hostel math, and travel admin tools.',
    tags: ['Budget', 'Checklists', 'Guides'],
    href: '#tools'
  },
  {
    title: 'Everything Added Later',
    label: '$3.99 / 6 months',
    labelClass: 'full',
    description: 'New games, stories, guides, and apps become part of the same simple 6-month access pass.',
    tags: ['No ads', 'No tiers', 'Simple'],
    href: '#pass'
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderLibrary() {
  const grid = document.querySelector('#libraryGrid');
  if (!grid) return;
  grid.innerHTML = libraryItems.map((item) => `
    <article class="library-card">
      <span class="badge ${escapeHtml(item.labelClass)}">${escapeHtml(item.label)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <div class="tags">
        ${item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
      </div>
      <a href="${escapeHtml(item.href)}">Open or preview →</a>
    </article>
  `).join('');
}

function wireNav() {
  const button = document.querySelector('.nav-toggle');
  const links = document.querySelector('#navLinks');
  if (!button || !links) return;
  button.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    });
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=10').catch((error) => {
      console.warn('Service worker registration failed', error);
    });
  }
}

function boot() {
  renderLibrary();
  wireNav();
  registerServiceWorker();
}

document.addEventListener('DOMContentLoaded', boot);

if (typeof module !== 'undefined') {
  module.exports = { libraryItems, escapeHtml };
}
