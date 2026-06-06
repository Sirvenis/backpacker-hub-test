(() => {
  const search = document.querySelector('#gameSearch');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('.game-card'));
  const rows = Array.from(document.querySelectorAll('.game-row-section'));
  const empty = document.querySelector('#emptyState');
  let activeFilter = 'all';

  function normalise(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardText(card) {
    return normalise([
      card.dataset.title,
      card.dataset.tags,
      card.textContent
    ].join(' '));
  }

  function matches(card, query, filter) {
    const haystack = cardText(card);
    const isComing = haystack.includes('coming') || haystack.includes('planned');
    const filterMatch = filter === 'all' || haystack.includes(filter) || (filter === 'coming' && isComing);
    const queryMatch = !query || haystack.includes(query);
    return filterMatch && queryMatch;
  }

  function updateButtons() {
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === activeFilter;
      button.classList.toggle('active', isActive);
      if (button.classList.contains('side-chip')) button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function updateRows() {
    rows.forEach((row) => {
      const visibleCards = row.querySelectorAll('.game-card:not(.is-hidden)').length;
      row.classList.toggle('is-hidden', visibleCards === 0);
    });
  }

  function applyFilters() {
    const query = normalise(search && search.value);
    let visible = 0;
    cards.forEach((card) => {
      const show = matches(card, query, activeFilter);
      card.classList.toggle('is-hidden', !show);
      if (show) visible += 1;
    });
    updateRows();
    if (empty) empty.hidden = visible > 0;
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      updateButtons();
      applyFilters();
    });
  });

  if (search) {
    search.addEventListener('input', applyFilters);
  }

  updateButtons();
  applyFilters();
})();
