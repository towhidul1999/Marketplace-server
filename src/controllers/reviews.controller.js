const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { reviewsService } = require("../services");

const createReview = catchAsync(async (req, res) => {
  const review = await reviewsService.createReview(req.body, req.user.id);
  res
    .status(httpStatus.CREATED)
    .json(
      response({
        message: "Review Created",
        status: "OK",
        statusCode: httpStatus.CREATED,
        data: review,
      })
    );
});

const getReviews = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "status", "userId", "gigId"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const reviews = await reviewsService.getReviews(
    filter,
    options,
    req.query.userId
  );
  res
    .status(httpStatus.OK)
    .json(
      response({
        message: "All Reviews",
        status: "OK",
        statusCode: httpStatus.OK,
        data: reviews,
      })
    );
});

module.exports = {
  createReview,
  getReviews,
};
