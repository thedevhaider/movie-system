const express = require("express");
const passport = require("passport");
const validateReviewInput = require("../../validation/review");
const router = express.Router();

// Load the Review model
const Review = require("../../models/Review.js");

// Load the Movie Model
const Movie = require("../../models/Movie.js");

// @routes     GET api/reviews/healthcheck
// @desc       Tests reviews routes
// @access     Public
router.get("/healthcheck", (req, res) =>
  res.json({ review: "Reviews Working" })
);

// @routes     POST api/reviews/:movie_id
// @desc       To Create a Review
// @access     Private
router.post(
  "/:movie_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Check if Movie exists in the database
    Movie.findById({ _id: req.params.movie_id })
      .then((movie) => {
        // Send 404 if movie not found
        if (!movie) {
          return res.status(404).json({ error: "Movie does not exists" });
        }

        // Search if current user has already given review
        Review.find({ movie, user: req.user })
          .then((reviews) => {
            // Check if user has already reviewed the movie
            if (reviews.length > 0) {
              return res
                .status(400)
                .json({ message: "You have already reviewd this movie" });
            }

            // Validate Review Inputs
            const { errors, isValid } = validateReviewInput(req.body);

            if (!isValid) {
              return res.status(400).json(errors);
            }

            // Creating Payload for creating Review
            const payload = {
              rating: req.body.rating,
              comment: req.body.comment,
              user: req.user,
              movie,
            };

            // Create New Review Object
            const newReview = new Review(payload);

            // Save Review
            newReview
              .save()
              .then((review) => {
                // Calculate average rating and count
                const newRatingCount = movie.rating_count + 1;
                let newAverageRating = 0;
                if (movie.average_rating) {
                  newAverageRating =
                    (movie.average_rating * movie.rating_count +
                      review.rating) /
                    newRatingCount;
                } else {
                  newAverageRating = review.rating / newRatingCount;
                }

                // Change Movie object with new ratings
                movie.rating_count = newRatingCount;
                movie.average_rating = newAverageRating;

                // Save Movie
                movie
                  .save()
                  .then((movie) =>
                    console.log("Changed movie average rating and count")
                  )
                  .catch((err) =>
                    console.log(
                      "Error occured while saving average rating and count",
                      err
                    )
                  );

                res.json(review);
              })
              .catch((err) => {
                console.log(err);
                res
                  .status(400)
                  .json({ error: "Error occured while creating review" });
              });
          })
          .catch((err) => {});
      })
      .catch((err) => {
        console.log(err);
        res.status(404).json({ error: "Movie does not exists" });
      });
  }
);

// @routes     GET api/reviews/:movie_id
// @desc       Get all reviews
// @access     Private
router.get(
  "/:movie_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Offsets for Pagination
    const skip = req.query.skip ? Number(req.query.skip) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    // List the reviews based on provided movie and paginate the result
    Review.find(
      { movie: req.params.movie_id },
      {},
      { skip: skip, limit: limit }
    )
      .populate("user", { password: 0 })
      .populate("movie")
      .sort({ rating: -1 })
      .then((reviews) => res.json(reviews))
      .catch((err) => {
        console.log(err);
        res.status(404).json({ noreviewfound: "No reviews found" });
      });
  }
);

module.exports = router;
