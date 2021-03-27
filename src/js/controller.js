import 'regenerator-runtime/runtime';
import 'core-js/stable';
import { async } from 'regenerator-runtime/runtime';

import * as model from './model.js';
import recipeView from './view/recipeView.js';
import searchView from './view/searchView.js';
import resultsView from './view/resultsView.js';
import paginationView from './view/paginationView.js';
import bookmarksView from './view/bookmarksView.js';
import addRecipeView from './view/addRecipeView.js';
import { TIMECLOSE_WINDOW } from './config.js';

const controlRecipe = async function () {
  try {
    // So that the Active class work each time
    resultsView.update(model.getSearchResultsPage());
    // Just like the results the bookmark also need to add in controlRecipe
    bookmarksView.update(model.state.bookmarks);

    const id = window.location.hash.slice(1);
    if (!id) return;

    // Rendering the spinner
    recipeView.renderSpinner();

    // Loading the recipe
    await model.loadRecipe(id);

    // Rendering the recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const updateServings = function (newServings) {
  // Update the recipe servings in the state
  model.updateServings(newServings);

  // Updating the recipe by update method
  recipeView.update(model.state.recipe);
};

const controlSearchResults = async function () {
  try {
    // Getting the query from the searchView by 'submitting the form'
    const query = searchView.getQuery();
    if (!query) return;

    // Rendering the spinner
    resultsView.renderSpinner();

    await model.loadSearchResults(query);
    // model.state.search.results;

    resultsView.render(model.getSearchResultsPage());

    // Adding additional pagination btns
    paginationView.render(model.state.search);
  } catch (err) {
    resultsView.renderError();
  }
};

const controlPagination = function (goToPage) {
  // Rendering the results on the page
  resultsView.render(model.getSearchResultsPage(goToPage));
  // Rendering the buttons
  paginationView.render(model.state.search);
};

const controlAddBookmarks = function () {
  if (!model.state.recipe.bookmarked) model.addBookmarks(model.state.recipe);
  else model.deleteBookmarks(model.state.recipe.id);

  // Updatng the recipeView for icons fill or not
  recipeView.update(model.state.recipe);

  // Rendering the bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Sending data to the model and awaiting it
    await model.uploadRecipe(newRecipe);

    // adding the bookmarks and then rendering on the bookmarks
    model.addBookmarks(model.state.recipe);
    bookmarksView.render(model.state.bookmarks);

    // Rendering that recipe on the page
    recipeView.render(model.state.recipe);

    // Rendering the success message
    addRecipeView.renderMessage();

    // Change id in the url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close the window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, TIMECLOSE_WINDOW * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerBookmarks(controlAddBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(updateServings);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
