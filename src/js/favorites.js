import MovieAPI from './MovieAPI.mjs';
import MovieList from './MovieList.mjs';
import { getFavorites, renderEmptyState } from './utils.js';
import { renderSiteHeader } from './siteHeader.js';

const favoritesContainer = document.querySelector('#favorites-results');
const api = new MovieAPI();

renderSiteHeader({ activePage: 'favorites' });

if (favoritesContainer) {
  const favorites = getFavorites();

  if (!favorites.length) {
    renderEmptyState(
      favoritesContainer,
      'You have not saved any favorites yet. Open a movie detail page and save one to see it here.',
    );
  } else {
    const favoritesList = new MovieList(favoritesContainer, api, {
      variant: 'grid',
      emptyMessage: 'You have not saved any favorites yet.',
    });
    favoritesList.render(favorites);
  }
}
