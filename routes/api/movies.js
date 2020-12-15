const express = require("express");
const passport = require("passport");
const validateMovieInput = require("../../validation/movie");
const router = express.Router();

// Load the Movie model
const Movie = require("../../models/Movie.js");

// @routes     GET api/movies/healthcheck
// @desc       Tests movies routes
// @access     Public
router.get("/healthcheck", (req, res) => res.json({ movie: "Movies Working" }));

// @routes     POST api/movies/
// @desc       To Create a Movie
// @access     Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Validate Register Inputs
    const { errors, isValid } = validateMovieInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Create New Movie Object
    const newMovie = new Movie({ name: req.body.name, user: req.user });

    // Save Movie
    newMovie
      .save()
      .then((movie) => res.json(movie))
      .catch((err) => {
        console.log(err);
        res.status(400).json({ error: "Error occured while creating movie" });
      });
  }
);

// @routes     GET api/movies/
// @desc       Get all movies
// @access     Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movie.find()
      .sort({ date: -1 })
      .then((movies) => res.json(movies))
      .catch((err) =>
        res.status(404).json({ nomoviefound: "No movies found" })
      );
  }
);

module.exports = router;
