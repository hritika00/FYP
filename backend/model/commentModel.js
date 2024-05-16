const moment = require("moment");
const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hotels",
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: moment(),
  },
});

const Comment = mongoose.model("comment", commentSchema);
module.exports = Comment;
