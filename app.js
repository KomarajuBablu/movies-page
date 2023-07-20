const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3003, () => {
      console.log("Server Running at: http://localhost:3003/");
    });
  } catch (e) {
    console.log(`DB Error Message: ${e.message}`);
    process.exit(1);
  }
};
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
const convertDbObjectToResponseObjectForMovieNames = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};
const convertDbObjectToResponsiveMovieName = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
intializeDBAndServer();

// API-1 ::

app.get("/movies/", async (request, response) => {
  const allMovieNamesQuery = `SELECT movie_name FROM movie;`;
  const allMovieNamesArray = await db.all(allMovieNamesQuery);
  response.send(
    allMovieNamesArray.map((movie) =>
      convertDbObjectToResponseObjectForMovieNames(movie)
    )
  );
});

// API-2 ::

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `INSERT INTO movie (director_id, movie_name, lead_actor) 
  VALUES (${directorId}, '${movieName}', '${leadActor}');`;
  const addMovie = await db.run(addMovieQuery);
  const movieId = addMovie.lastID;
  response.send("Movie Successfully Added");
});

// API-3 ::

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getmovieDetailQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movie = await db.get(getmovieDetailQuery);
  response.send(convertDbObjectToResponsiveMovieName(movie));
  response.send(movie);
});

// API-4::

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `UPDATE movie SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API-5::

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deletMovieQuery);
  response.send("Movie Removed");
});

//API-6

app.get("/directors/", async (request, response) => {
  const allMovieNamesQuery = `SELECT * FROM director;`;
  const allMovieNamesArray = await db.all(allMovieNamesQuery);
  response.send(
    allMovieNamesArray.map((director) =>
      convertDbObjectToResponseObject(director)
    )
  );
});

//API-7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getmovieDetailQuery = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`;
  const movie = await db.all(getmovieDetailQuery);
  response.send(
    movie.map((movie) => convertDbObjectToResponseObjectForMovieNames(movie))
  );
});

module.exports = app;
