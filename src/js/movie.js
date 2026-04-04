import MovieAPI from './MovieAPI.mjs';
import MovieDetails from './MovieDetails.mjs';
import { getParam } from './utils.js';

const api = new MovieAPI();
const movieId = getParam('id');
const container = document.querySelector('#movie-detail');

if (container) {
  const detailView = new MovieDetails(container, api, movieId);
  detailView.init();
}
