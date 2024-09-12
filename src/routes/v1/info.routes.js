const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const infoController = require("../../controllers/info.controller");

const router = express.Router();

router
  .route("/privacy")
  .post(auth("admin"), infoController.createPrivacy)
  .get(infoController.queryPrivacy);
router
  .route("/terms")
  .post(auth("admin"), infoController.createTerms)
  .get(infoController.queryTerms);
router
  .route("/trust-safety")
  .post(auth("admin"), infoController.createTrustSafety)
  .get(infoController.queryTrustSafety);

module.exports = router;
