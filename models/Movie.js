const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Creating Schema
const MovieSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  rating_count: {
    type: Number,
    default: 0,
  },
  average_rating: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("movies", MovieSchema);
