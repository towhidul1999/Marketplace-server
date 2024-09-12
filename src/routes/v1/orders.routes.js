const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const ordersController = require("../../controllers/orders.controller");
const bodyParser = require("body-parser");

const router = express.Router();

router
  .route("/webhook")
  .post(
    bodyParser.raw({ type: "application/json" }),
    ordersController.orderPlaced
  );
router
  .route("/freelancer")
  .get(auth("freelancer"), ordersController.freelancerOrdersList);

router
  .route("/checkout")
  .post(ordersController.orderCreate)
  //   .patch(auth("admin"), categoriesController.updateCategory)
  .get(auth("withOutAdmin"), ordersController.getOrders);
router
  .route("/totalIncome")
  .get(auth("withOutAdmin"), ordersController.myTotalIncome);
router
  .route("/")
  .patch(auth("withOutAdmin"), ordersController.orderModify)
  .get(auth("withOutAdmin"), ordersController.getMyOrders);
router
.route("/:orderId")
.get(auth("withOutAdmin"), ordersController.getOrderById)
// router
//   .route("/:orderId")
//   .get(categoriesController.getCategory)
//   .delete(auth("admin"), categoriesController.deleteCategory);

module.exports = router;
