const express = require("express");
const auth = require("../../middlewares/auth");
const router = express.Router();
const reviewController = require("../../controllers/reviews.controller");

router
  .route("/")
  .post(auth("common"), reviewController.createReview)
  .get(auth("common"),reviewController.getReviews);

module.exports = router;
