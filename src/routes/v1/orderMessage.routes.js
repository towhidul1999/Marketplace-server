const { Router } = require("express");
const auth = require("../../middlewares/auth");
const orderMessageController = require("../../controllers/orderMessage.controller");
const router = Router();
const userFileUploadMiddleware = require("../../middlewares/messageFileUpload");
const fs = require("fs");

const UPLOADS_FOLDER_MESSAGES = "./public/uploads/orderMessage";

// Ensure the upload folder exists
if (!fs.existsSync(UPLOADS_FOLDER_MESSAGES)) {
  fs.mkdirSync(UPLOADS_FOLDER_MESSAGES, { recursive: true });
}
const uploadOrderMessageFiles = userFileUploadMiddleware(
  UPLOADS_FOLDER_MESSAGES
);

router
  .route("/")
  .post(
    auth("withOutAdmin"),
    [uploadOrderMessageFiles.array("files")],
    orderMessageController.addOrderMessage
  )
  .get(auth("withOutAdmin"), orderMessageController.getOrderMessages);

module.exports = router;
