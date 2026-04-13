import {
  formatDate,
  formatRating,
  formatRuntime,
  isFavorite,
  renderErrorState,
  renderLoadingState,
  toggleFavoriteMovie,
} from './utils.js';
import MovieList from './MovieList.mjs';

export default class MovieDetails {
  constructor(container, api, movieId) {
    this.container = container;
    this.api = api;
    this.movieId = movieId;
    this.credits = [];
    this.similarMovies = [];
    this.trailer = null;
    this.movie = null;
  }

  async init() {
    if (!this.movieId) {
      renderErrorState(this.container, 'We could not tell which movie you wanted. Please return and select one again.');
      return;
    }

    renderLoadingState(this.container, 'Loading movie details...');

    try {
      const movie = await this.api.getMovieDetails(this.movieId);
      this.movie = movie;
      this.credits = await this.loadCredits();
      this.similarMovies = await this.loadSimilarMovies();
      this.trailer = await this.loadTrailer();
      document.title = `Movie Explorer | ${movie.title}`;
      this.render(movie);
    } catch (error) {
      renderErrorState(this.container, error.message);
    }
  }

  async loadCredits() {
    try {
      const credits = await this.api.getMovieCredits(this.movieId);
      return credits.cast?.slice(0, 8) || [];
    } catch (error) {
      return [];
    }
  }

  async loadSimilarMovies() {
    try {
      const movies = await this.api.getSimilarMovies(this.movieId);
      return movies.slice(0, 6);
    } catch (error) {
      return [];
    }
  }

  async loadTrailer() {
    try {
      const videos = await this.api.getMovieVideos(this.movieId);

      return (
        videos.find(
          (video) =>
            video.site === 'YouTube' &&
            video.type === 'Trailer' &&
            video.official,
        ) ||
        videos.find(
          (video) => video.site === 'YouTube' && video.type === 'Trailer',
        ) ||
        videos.find((video) => video.site === 'YouTube') ||
        null
      );
    } catch (error) {
      return null;
    }
  }

  renderCastSection() {
    if (!this.credits.length) {
      return `
        <div class="detail-panel">
          <h2 class="subsection-title">Cast</h2>
          <p class="mt-4 text-cinema-muted">
            Cast details are unavailable for this title right now. Please try another movie.
          </p>
        </div>
      `;
    }

    return `
      <div class="detail-panel xl:col-span-3">
        <div class="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div class="min-w-0">
            <p class="section-kicker">People in the story</p>
            <h2 class="subsection-title">Top Cast</h2>
          </div>
          <p class="max-w-full text-sm leading-6 text-cinema-muted sm:ml-6 sm:max-w-sm sm:text-right">
            Showing the first ${this.credits.length} cast members from TMDB.
          </p>
        </div>
        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          ${this.credits
            .map(
              (person) => `
                <article class="grid min-h-28 grid-cols-[96px_1fr] overflow-hidden rounded-[1.25rem] border border-white/8 bg-white/4 md:block md:rounded-[1.5rem]">
                  <img
                    src="${this.api.buildProfileUrl(person.profile_path)}"
                    alt="Profile photo for ${person.name}"
                    class="h-full w-full object-cover bg-cinema-soft md:aspect-[3/4] md:h-auto"
                  />
                  <div class="flex flex-col justify-center space-y-2 px-3 py-3 sm:px-4">
                    <h3 class="font-display text-xl uppercase tracking-[0.08em] sm:text-2xl">${person.name}</h3>
                    <p class="text-xs uppercase tracking-[0.16em] text-cinema-accent sm:text-sm">${person.character || 'Character unavailable'}</p>
                  </div>
                </article>
              `,
            )
            .join('')}
        </div>
      </div>
    `;
  }

  renderSimilarMoviesSection() {
    if (!this.similarMovies.length) {
      return `
        <div class="detail-panel">
          <h2 class="subsection-title">Similar Movies</h2>
          <p class="mt-4 text-cinema-muted">
            We could not find related titles for this movie right now.
          </p>
        </div>
      `;
    }

    return `
      <div class="detail-panel xl:col-span-3">
        <div class="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div class="min-w-0">
            <p class="section-kicker">You might also like</p>
            <h2 class="subsection-title">Similar Movies</h2>
          </div>
          <p class="max-w-full text-sm leading-6 text-cinema-muted sm:ml-6 sm:max-w-sm sm:text-right">
            Picked from TMDB recommendations for this title.
          </p>
        </div>
        <div id="similar-movies" class="mt-6"></div>
      </div>
    `;
  }

  renderTrailerSection() {
    if (!this.trailer?.key) {
      return `
        <div class="detail-panel">
          <h2 class="subsection-title">Trailer</h2>
          <p class="mt-4 text-cinema-muted">
            A trailer is not available for this title right now.
          </p>
        </div>
      `;
    }

    const trailerTitle = this.trailer.name || 'Official Trailer';
    const embedUrl = `https://www.youtube.com/embed/${this.trailer.key}`;

    return `
      <div class="detail-panel xl:col-span-2">
        <div class="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div class="min-w-0">
            <p class="section-kicker">Watch before you commit</p>
            <h2 class="subsection-title">Trailer</h2>
          </div>
          <p class="max-w-full text-sm leading-6 text-cinema-muted sm:ml-6 sm:max-w-sm sm:text-right">
            ${trailerTitle}
          </p>
        </div>
        <div class="mx-auto mt-6 max-w-4xl overflow-hidden rounded-[1.5rem] border border-white/8 bg-cinema-soft">
          <div class="relative w-full overflow-hidden" style="aspect-ratio: 16 / 9;">
            <iframe
              class="absolute inset-0 h-full w-full"
              src="${embedUrl}"
              title="${trailerTitle}"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </div>
    `;
  }

  render(movie) {
    const title = movie.title || 'Untitled movie';
    const poster = this.api.buildPosterUrl(movie.poster_path, 'w780');
    const backdrop = this.api.buildBackdropUrl(movie.backdrop_path);
    const genres = movie.genres?.length
      ? movie.genres.map((genre) => `<span class="detail-chip">${genre.name}</span>`).join('')
      : '<span class="detail-chip">Genre info coming soon</span>';

    this.container.innerHTML = `
      <section class="overflow-hidden rounded-[2rem] border border-white/10 bg-cinema-panel shadow-2xl shadow-black/30">
        <div class="relative min-h-64 border-b border-white/10 bg-cinema-soft sm:min-h-72">
          <img src="${backdrop}" alt="Backdrop for ${title}" class="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div class="absolute inset-0 bg-gradient-to-t from-cinema-panel via-cinema-panel/85 to-black/20"></div>
          <div class="relative flex h-full items-end px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
            <div>
              <p class="section-kicker">Movie detail</p>
              <h1 class="mt-3 max-w-4xl font-display text-4xl uppercase leading-none tracking-[0.08em] sm:text-5xl lg:text-6xl">${title}</h1>
              <p class="mt-4 max-w-3xl text-sm text-cinema-muted sm:text-base">${movie.tagline || 'Everything you need to decide if this should be your next watch.'}</p>
            </div>
          </div>
        </div>

        <div class="grid gap-6 p-4 sm:gap-8 sm:p-6 xl:grid-cols-[320px_1fr] xl:p-10">
          <div class="detail-panel mx-auto w-full max-w-sm self-start xl:mx-0 xl:max-w-none">
            <div class="overflow-hidden rounded-[1.5rem] bg-cinema-soft">
              <img src="${poster}" alt="Poster for ${title}" class="aspect-[2/3] w-full object-cover" />
            </div>
            <div class="mt-5 flex flex-wrap gap-3">
              <span class="detail-chip">Rating ${formatRating(movie.vote_average)}</span>
              <span class="detail-chip">${formatRuntime(movie.runtime)}</span>
            </div>
            <button
              id="favorite-toggle"
              type="button"
              class="primary-button mt-5 w-full"
              aria-pressed="${isFavorite(movie.id) ? 'true' : 'false'}"
            >
              ${isFavorite(movie.id) ? 'Remove from Favorites' : 'Save to Favorites'}
            </button>
          </div>

          <div class="space-y-8">
            <section class="detail-panel">
              <div class="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                <div>
                  <p class="text-sm uppercase tracking-[0.18em] text-cinema-muted">Release Date</p>
                  <p class="mt-2 text-lg font-semibold">${formatDate(movie.release_date)}</p>
                </div>
                <div>
                  <p class="text-sm uppercase tracking-[0.18em] text-cinema-muted">Language</p>
                  <p class="mt-2 text-lg font-semibold">${movie.original_language?.toUpperCase() || 'N/A'}</p>
                </div>
                <div>
                  <p class="text-sm uppercase tracking-[0.18em] text-cinema-muted">Popularity</p>
                  <p class="mt-2 text-lg font-semibold">${formatRating(movie.popularity)}</p>
                </div>
                <div>
                  <p class="text-sm uppercase tracking-[0.18em] text-cinema-muted">Vote Count</p>
                  <p class="mt-2 text-lg font-semibold">${movie.vote_count || 0}</p>
                </div>
              </div>
            </section>

            <section class="detail-panel">
              <h2 class="subsection-title">Overview</h2>
              <p class="mt-4 max-w-4xl text-lg leading-8 text-cinema-muted">${movie.overview || 'An overview for this movie is not available yet.'}</p>
            </section>

            <section class="detail-panel">
              <h2 class="subsection-title">Genres</h2>
              <div class="mt-4 flex flex-wrap gap-3">${genres}</div>
            </section>

            <section class="grid gap-6 2xl:grid-cols-3">
              ${this.renderCastSection()}
              ${this.renderTrailerSection()}
              ${this.renderSimilarMoviesSection()}
            </section>
          </div>
        </div>
      </section>
    `;

    const similarMoviesContainer = this.container.querySelector('#similar-movies');
    if (similarMoviesContainer && this.similarMovies.length) {
      const similarMoviesList = new MovieList(similarMoviesContainer, this.api, {
        emptyMessage: 'We could not find related titles for this movie right now.',
      });
      similarMoviesList.render(this.similarMovies);
    }

    const favoriteToggle = this.container.querySelector('#favorite-toggle');
    if (favoriteToggle && this.movie) {
      favoriteToggle.addEventListener('click', () => {
        const nextState = toggleFavoriteMovie({
          id: this.movie.id,
          title: this.movie.title,
          poster_path: this.movie.poster_path,
          release_date: this.movie.release_date,
          vote_average: this.movie.vote_average,
        });

        favoriteToggle.textContent = nextState
          ? 'Remove from Favorites'
          : 'Save to Favorites';
        favoriteToggle.setAttribute('aria-pressed', nextState ? 'true' : 'false');
      });
    }
  }
}
