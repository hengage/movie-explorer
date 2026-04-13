import { buildMovieUrl, formatRating, formatReleaseYear, renderEmptyState } from './utils.js';

export default class MovieList {
  constructor(container, api, options = {}) {
    this.container = container;
    this.api = api;
    this.variant = options.variant || 'row';
    this.emptyMessage = options.emptyMessage || 'No movies are available right now.';
  }

  render(items = []) {
    if (!items.length) {
      renderEmptyState(this.container, this.emptyMessage);
      return;
    }

    const wrapperClass = this.variant === 'grid' ? 'movie-grid' : 'movie-row';
    const cardModifier = this.variant === 'grid' ? ' movie-card-grid' : '';

    this.container.innerHTML = `
      <div class="${wrapperClass}">
        ${items.map((movie) => this.movieCardTemplate(movie, cardModifier)).join('')}
      </div>
    `;
  }

  movieCardTemplate(movie, cardModifier) {
    const title = movie.title || movie.name || 'Untitled movie';
    const poster = this.api.buildPosterUrl(movie.poster_path);
    const year = formatReleaseYear(movie.release_date);
    const rating = formatRating(movie.vote_average);
    const cardLabel = `Open details for ${title}. Released ${year}. Rating ${rating}.`;

    return `
      <a class="movie-card${cardModifier}" href="${buildMovieUrl(movie.id)}" aria-label="${cardLabel}">
        <div class="movie-poster-wrap">
          <img class="movie-poster" src="${poster}" alt="Poster for ${title}" loading="lazy" />
          <span class="rating-badge">${rating}</span>
        </div>
        <div class="movie-card-body">
          <h3 class="movie-card-title">${title}</h3>
          <p class="movie-card-meta">${year}</p>
        </div>
      </a>
    `;
  }
}
