import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.API_KEY;

function createSearchQuery(string) {
  const urlString = encodeURIComponent(string);
  return `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=de-GER&query=${urlString}&page=1&include_adult=true&region=DE`;
}

function createDetailsQuery(id, type) {
  switch (type) {
    case "movie":
      return `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=de-GER`;
    case "tv":
      return `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=de-GER`;
    default:
      throw new Error("Type is not valid");
  }
}

function createSeasonQuery(id, season) {
  return `https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${apiKey}&language=de-GER`;
}

export function search(string) {
  return new Promise((resolve, reject) => {
    fetch(createSearchQuery(string))
      .then((response) => response.json())
      .then((data) => {
        resolve(data.results);
      })
      .catch((error) => {
        console.log(
          "🚀 ~ file: createQuery.js:41 ~ returnnewPromise ~ error",
          error
        );
      });
  });
}

export function getDetails(id, type) {
  return new Promise((resolve, reject) => {
    fetch(createDetailsQuery(id, type))
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        console.log(
          "🚀 ~ file: createQuery.js:41 ~ returnnewPromise ~ error",
          error
        );
      });
  });
}

export function getSeason(id, season) {
  return new Promise((resolve, reject) => {
    fetch(createSeasonQuery(id, season))
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        console.log(
          "🚀 ~ file: createQuery.js:41 ~ returnnewPromise ~ error",
          error
        );
      });
  });
}
