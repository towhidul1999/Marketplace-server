const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const reviewSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    freelancerId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    gigId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Gig",
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
reviewSchema.plugin(paginate);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
