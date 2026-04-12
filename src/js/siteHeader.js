function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderNavLinks(activePage) {
  const links = [
    { href: '/index.html', label: 'Home', key: 'home' },
    { href: '/search/index.html', label: 'Search', key: 'search' },
    { href: '/favorites/index.html', label: 'Favorites', key: 'favorites' },
  ];

  return links
    .map(({ href, label, key }) => {
      const isActive = activePage === key;
      return `
        <a
          href="${href}"
          class="site-nav-link${isActive ? ' site-nav-link-active' : ''}"
          ${isActive ? 'aria-current="page"' : ''}
        >
          ${label}
        </a>
      `;
    })
    .join('');
}

export function renderSiteHeader({
  activePage = '',
  showSearch = false,
  searchValue = '',
} = {}) {
  const header = document.querySelector('#site-header');
  if (!header) return;

  const searchMarkup = showSearch
    ? `
      <div class="site-header-search-shell">
        <form id="search-form" class="flex w-full flex-col gap-3 sm:flex-row">
          <label class="sr-only" for="query">Search for a movie</label>
          <input
            id="query"
            name="query"
            type="search"
            placeholder="Search by movie title"
            value="${escapeHtml(searchValue)}"
            class="search-input w-full sm:flex-1"
            required
          />
          <button type="submit" class="primary-button sm:min-w-40">Search</button>
        </form>
      </div>
    `
    : '';

  header.innerHTML = `
    <div class="site-header-inner">
      <div class="site-header-main">
        <a href="/index.html" class="site-brand">Movie Explorer</a>
        <nav class="site-nav">
          ${renderNavLinks(activePage)}
        </nav>
      </div>
      ${searchMarkup}
    </div>
  `;
}
