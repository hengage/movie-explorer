export function getParam(name, search = window.location.search) {
  const params = new URLSearchParams(search);
  return params.get(name);
}

export function buildSearchUrl(query, page = 1) {
  const url = new URL('/search/index.html', window.location.origin);
  url.searchParams.set('q', query.trim());
  url.searchParams.set('page', page);
  return `${url.pathname}${url.search}`;
}

export function buildMovieUrl(id) {
  const url = new URL('/movie/index.html', window.location.origin);
  url.searchParams.set('id', id);
  return `${url.pathname}${url.search}`;
}

export function updateQueryParams(pathname, params) {
  const url = new URL(pathname, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });

  return `${url.pathname}${url.search}`;
}

export function formatReleaseYear(dateString) {
  if (!dateString) return 'Release date unavailable';
  return new Date(dateString).getFullYear().toString();
}

export function formatRuntime(minutes) {
  if (!minutes || Number.isNaN(Number(minutes))) {
    return 'Runtime unavailable';
  }

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (!hrs) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

export function formatRating(value) {
  const rating = Number(value);
  if (Number.isNaN(rating) || rating <= 0) return 'N/A';
  return rating.toFixed(1);
}

export function formatDate(dateString) {
  if (!dateString) return 'Release date unavailable';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function renderLoadingState(container, message = 'Loading movies...') {
  container.innerHTML = `<div class="state-card">${message}</div>`;
}

export function renderErrorState(container, message = 'Something went wrong while loading this section.') {
  container.innerHTML = `<div class="state-card text-cinema-danger">${message}</div>`;
}

export function renderEmptyState(container, message = 'Nothing to show yet.') {
  container.innerHTML = `<div class="state-card">${message}</div>`;
}
