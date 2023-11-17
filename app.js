const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const caseConversion = (dbData) => {
  return {
    movieId: dbData.movie_id,
    directorId: dbData.director_id,
    movieName: dbData.movie_name,
    leadActor: dbData.lead_actor,
  };
};

const dirConversion = (data) => {
  return {
    directorId: data.director_id,
    directorName: director_name,
  };
};

////Get

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray.map((dbData) => caseConversion(dbData)));
});

////Get Id

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(caseConversion(movie));
});

////Post

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
      movie (director_id, movie_name, lead_actor)
    VALUES(${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

////Put

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateQuery = `UPDATE movie
   SET director_id =${directorId},
   movie_name = '${movieName}',
   lead_actor = "${leadActor}"
   WHERE movie_id = ${movieId};`;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updateQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(updateQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const directorQuery = `SELECT * from director;`;
  const dirArray = await db.all(directorQuery);
  response.send(dirArray.map((dr) => dirConversion(dr)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirQuery = `
    SELECT
      *
    FROM
      director
    WHERE
      director_id = ${directorId};`;
  const director = await db.get(getDirQuery);
  response.send(dirConversion(director));
});

module.exports = app;
