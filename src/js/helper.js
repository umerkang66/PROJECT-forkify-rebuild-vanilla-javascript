import { async } from 'regenerator-runtime';

import { TIMEOUT_SEC } from './config.js';

// This is the timeout function that will reject and throw new Error, we will use it in the Promose.race, to reject when the specific path is passed
export const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    // Fetching the data from api
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    // Racing by Promse.race
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

    // Converting the response of fetchPro to the actual data by using json method
    const data = await res.json();
    // Returning the actual data to the model
    return data;
  } catch (err) {
    throw err;
  }
};

/*
export const getJSON = async function (url) {
  try {
    // Fetching the data from api
    const fetchPro = fetch(url);

    // Racing by Promse.race
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

    // Converting the response of fetchPro to the actual data by using json method
    const data = await res.json();
    // Returning the actual data to the model
    return data;
  } catch (err) {
    throw err;
  }
};
*/
