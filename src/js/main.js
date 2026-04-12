import MovieAPI from './MovieAPI.mjs';
import MovieList from './MovieList.mjs';
import { renderSiteHeader } from './siteHeader.js';
import { buildSearchUrl, renderErrorState, renderLoadingState } from './utils.js';

const api = new MovieAPI();

renderSiteHeader({ activePage: 'home' });

function setupSearch(formSelector, inputSelector) {
  const form = document.querySelector(formSelector);
  const input = document.querySelector(inputSelector);

  if (!form || !input) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    window.location.href = buildSearchUrl(query, 1);
  });
}

async function loadSection(containerSelector, fetcher, emptyMessage) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  renderLoadingState(container);

  try {
    const items = await fetcher();
    const list = new MovieList(container, api, { emptyMessage });
    list.render(items);
  } catch (error) {
    renderErrorState(container, error.message);
  }
}

setupSearch('#hero-search-form', '#hero-query');

loadSection('#now-playing', () => api.getNowPlaying(), 'No movies are in theaters right now.');
loadSection('#popular', () => api.getPopular(), 'Popular movies are unavailable right now.');
loadSection('#top-rated', () => api.getTopRated(), 'Top-rated movies are unavailable right now.');
