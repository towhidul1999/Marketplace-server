const express = require("express");
const auth = require("../../middlewares/auth");
const withdrawalController = require("../../controllers/withdrawal.controller");

const router = express.Router();

router
  .route("/my")
  .get(auth("freelancer"), withdrawalController.getSingleUserWithdrawals);
router
  .route("/single")
  .get(auth("admin"), withdrawalController.getSingleWithdrawal);
router
  .route("/")
  .get(withdrawalController.getWithdrawals)
  .post(auth("freelancer"), withdrawalController.createWithdrawal);

router
  .route("/:withdrawalId")
  .patch(auth("common"), withdrawalController.withdrawalCancel)
  .post(auth("common"), withdrawalController.withdrawalApprove);

module.exports = router;
