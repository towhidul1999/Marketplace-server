const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Reviews } = require("../models");

const createReview = async (review, userId) => {
  const gig = await Reviews.findOne({ gigId: review.gigId, userId });
  if (gig) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Gig already reviewed");
  }
  const newReview = await Reviews.create({ ...review, userId });
  return newReview;
};

const getReviews = async (filter, options, userId) => {
  if (userId) {
    filter.userId = userId;
  }

  options.populate = [
    {
      path: "gigId",
    },
    {
      path: "userId",
    },
    {
      path: "freelancerId",
    },
  ];
  const reviews = await Reviews.paginate(filter, options);
  return reviews;
};

module.exports = {
  getReviews,
};

module.exports = {
  createReview,
  getReviews,
};
