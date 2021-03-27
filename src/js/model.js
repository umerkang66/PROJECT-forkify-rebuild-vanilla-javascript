import { async } from 'regenerator-runtime';

import { API_URL, KEY, RES_PER_PAGE } from './config.js';
import { AJAX } from './helper.js';
// import { getJSON } from './helper.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;

  return {
    cookingTime: recipe.cooking_time,
    id: recipe.id,
    image: recipe.image_url,
    ingredients: recipe.ingredients,
    publisher: recipe.publisher,
    servings: recipe.servings,
    sourceUrl: recipe.source_url,
    title: recipe.title,
    ...(recipe.key && { key: recipe.key }),
  };
};

// Load the recipe and store the data in the state.recipe
export const loadRecipe = async function (id) {
  try {
    // Getting data from getJson from the config
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

    // Sending data to the state.recipe
    state.recipe = createRecipeObject(data);

    // Creating the bookmarked property in the state.recipe
    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else state.recipe.bookmarked = false;
  } catch (err) {
    throw err;
  }
};

// Model method for updating the servings
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    // newQuantity = oldQuantity * newServings / oldServings
  });

  state.recipe.servings = newServings;
};

// Model of Getting search results
export const loadSearchResults = async function (query) {
  try {
    // Getting the data from api
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    // returning the only results to the State Object
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });

    // For every time a new search happens, it always start from the page 1
    state.search.page = 1;

    // If the query is not correct, creating the error
    if (state.search.results.length < 1) throw new Error();
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; // 0 for page 1, 10 for page 2
  const end = page * state.search.resultsPerPage; // 10 for page 1, 20 for page 2

  return state.search.results.slice(start, end);
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmarks = function (recipe) {
  // Putting that recipe to the state.bookmarks (that is array)
  state.bookmarks.push(recipe);
  // Mark current recipe as the bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  // Persist bookmarks, meaning adding the newly created bookmarks to the localStorage
  persistBookmarks();
};

export const deleteBookmarks = function (id) {
  // Finding the index of the bookmark that is passed in this function through this id
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
  // after finding the index deleting from the array through splice method
  state.bookmarks.splice(index, 1);
  // Unmarking the recipe that is deleted as the bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  // Persist bookmarks, meaning adding the newly created bookmarks to the localStorage
  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',');

        // Creating new error
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format'
          );

        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      source_url: newRecipe.sourceUrl,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
  } catch (err) {
    throw err;
  }
};
