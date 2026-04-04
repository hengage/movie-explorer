import MovieAPI from './MovieAPI.mjs';
import MovieList from './MovieList.mjs';
import {
  buildSearchUrl,
  getParam,
  renderEmptyState,
  renderErrorState,
  renderLoadingState,
  updateQueryParams,
} from './utils.js';

const api = new MovieAPI();
const query = getParam('q') || '';
const page = Number(getParam('page') || 1);
const resultsContainer = document.querySelector('#search-results');
const summary = document.querySelector('#results-summary');
const pagination = document.querySelector('#pagination');
const form = document.querySelector('#search-form');
const input = document.querySelector('#query');

if (input) {
  input.value = query;
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const nextQuery = input.value.trim();
    if (!nextQuery) return;
    window.location.href = buildSearchUrl(nextQuery, 1);
  });
}

function renderPagination(currentPage, totalPages) {
  if (!pagination) return;

  const previousDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  pagination.innerHTML = `
    <button ${previousDisabled ? 'disabled' : ''} data-page="${currentPage - 1}" class="primary-button ${previousDisabled ? 'cursor-not-allowed opacity-40 hover:translate-y-0 hover:shadow-none' : ''}">
      Previous
    </button>
    <span class="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-cinema-muted">
      Page ${currentPage} of ${totalPages || 1}
    </span>
    <button ${nextDisabled ? 'disabled' : ''} data-page="${currentPage + 1}" class="primary-button ${nextDisabled ? 'cursor-not-allowed opacity-40 hover:translate-y-0 hover:shadow-none' : ''}">
      Next
    </button>
  `;

  pagination.querySelectorAll('button[data-page]').forEach((button) => {
    if (button.hasAttribute('disabled')) return;

    button.addEventListener('click', () => {
      const nextPage = Number(button.dataset.page);
      window.location.href = updateQueryParams('/search/index.html', {
        q: query,
        page: nextPage,
      });
    });
  });
}

async function init() {
  if (!resultsContainer) return;

  if (!query.trim()) {
    if (summary) {
      summary.textContent = 'Start with a title and we will pull matching movies here.';
    }
    renderEmptyState(resultsContainer, 'Search for a movie title to see matching results.');
    if (pagination) pagination.innerHTML = '';
    return;
  }

  renderLoadingState(resultsContainer, `Searching for "${query}"...`);

  try {
    const data = await api.searchMovies(query, page);

    if (summary) {
      summary.textContent = `${data.total_results || 0} results found for "${query}".`;
    }

    if (!data.results?.length) {
      renderEmptyState(resultsContainer, `No matches found for "${query}". Try another title.`);
      if (pagination) pagination.innerHTML = '';
      return;
    }

    const list = new MovieList(resultsContainer, api, {
      variant: 'grid',
      emptyMessage: `No matches found for "${query}".`,
    });
    list.render(data.results);
    renderPagination(data.page || 1, Math.min(data.total_pages || 1, 500));
  } catch (error) {
    renderErrorState(resultsContainer, error.message);
    if (summary) {
      summary.textContent = 'We could not load search results right now.';
    }
    if (pagination) pagination.innerHTML = '';
  }
}

init();
