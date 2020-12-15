const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateReviewInput(data) {
  let errors = {};

  data.comment = !isEmpty(data.comment) ? data.comment : "";

  if (!Validator.isLength(data.comment, { min: 10, max: 500 })) {
    errors.comment = "Comment must be 10 to 500 Characters long";
  }

  if (Validator.isEmpty(data.comment)) {
    errors.comment = "Comment is required";
  }

  if (!isEmpty(data.rating) && (data.rating < 1 || data.rating > 5)) {
    errors.rating = "Rating should be between 1 and 5 inclusively";
  }

  if (isEmpty(data.rating)) {
    errors.rating = "Rating is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
