const baseURL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3/';
const apiKey = import.meta.env.VITE_TMDB_API_KEY;
const imageBaseURL = 'https://image.tmdb.org/t/p/';
const responseCache = new Map();

function ensureConfig() {
  if (!apiKey) {
    throw new Error('Missing VITE_TMDB_API_KEY. Add it to your .env file and restart Vite.');
  }
}

function buildUrl(path, params = {}) {
  ensureConfig();

  const normalizedBase = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
  const url = new URL(path, normalizedBase);
  url.searchParams.set('api_key', apiKey);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function request(path, params) {
  const url = buildUrl(path, params);

  if (responseCache.has(url)) {
    return responseCache.get(url);
  }

  const promise = fetch(url)
    .then(async (response) => {
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.status_message ||
            data?.message ||
            'Unable to fetch movie data right now. Please try again.',
        );
      }

      return data;
    })
    .catch((error) => {
      responseCache.delete(url);
      throw error;
    });

  responseCache.set(url, promise);
  return promise;
}

export default class MovieAPI {
  async getNowPlaying(page = 1) {
    const data = await request('movie/now_playing', { page });
    return data.results || [];
  }

  async getPopular(page = 1) {
    const data = await request('movie/popular', { page });
    return data.results || [];
  }

  async getTopRated(page = 1) {
    const data = await request('movie/top_rated', { page });
    return data.results || [];
  }

  async searchMovies(query, page = 1) {
    if (!query?.trim()) {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }

    return request('search/movie', {
      query: query.trim(),
      page,
      include_adult: 'false',
    });
  }

  async getMovieDetails(id) {
    return request(`movie/${id}`);
  }

  async getMovieCredits(id) {
    return request(`movie/${id}/credits`);
  }

  async getGenres() {
    return request('genre/movie/list');
  }

  buildPosterUrl(path, size = 'w500') {
    return path ? `${imageBaseURL}${size}${path}` : '/placeholder-poster.svg';
  }

  buildBackdropUrl(path, size = 'w1280') {
    return path ? `${imageBaseURL}${size}${path}` : '/placeholder-poster.svg';
  }
}
