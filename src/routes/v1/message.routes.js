const express = require("express");
const auth = require("../../middlewares/auth");
const messageController = require("../../controllers/message.controller");
const userFileUploadMiddleware = require("../../middlewares/messageFileUpload");
const fs = require("fs");

const UPLOADS_FOLDER_MESSAGES = "./public/uploads/messages";

// Ensure the upload folder exists
if (!fs.existsSync(UPLOADS_FOLDER_MESSAGES)) {
  fs.mkdirSync(UPLOADS_FOLDER_MESSAGES, { recursive: true });
}
const uploadMessageFiles = userFileUploadMiddleware(UPLOADS_FOLDER_MESSAGES);

const router = express.Router();
router
  .route("/add-message")
  .post(
    auth("withOutAdmin"),
    [uploadMessageFiles.array("files")],
    messageController.addMessage
  );
router
  .route("/get-messages")
  .get(auth("withOutAdmin"), messageController.getMessages);
router
  .route("/:messageId")
  .get(auth("withOutAdmin"), messageController.getMessage)
  .patch(auth("withOutAdmin"), messageController.updateMessageStatus)
  .delete(auth("withOutAdmin"), messageController.deleteMessage);

module.exports = router;
