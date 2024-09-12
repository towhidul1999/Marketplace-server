const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const userValidation = require("../../validations/user.validation");
const userController = require("../../controllers/user.controller");
const userFileUploadMiddleware = require("../../middlewares/fileUpload");
const convertHeicToPngMiddleware = require("../../middlewares/converter");
const UPLOADS_FOLDER_USERS = "./public/uploads/users";

const uploadUsers = userFileUploadMiddleware(UPLOADS_FOLDER_USERS);

const router = express.Router();
router.route("/profile").post(auth("common"), userController.updateUser);
router
  .route("/profile-image")
  .post(
    auth("common"),
    [uploadUsers.single("image")],
    convertHeicToPngMiddleware(UPLOADS_FOLDER_USERS),
    userController.updateProfileImage
  );

router
  .route("/cover-image")
  .post(
    auth("common"),
    [uploadUsers.single("image")],
    convertHeicToPngMiddleware(UPLOADS_FOLDER_USERS),
    userController.updateCoverImage
  );
router.route("/public").get(userController.getUsersPublicById);
router.route("/").get(userController.getUsers);
//user stats
router.route("/stats").get(auth("common"), userController.getUserStats);

router
  .route("/:userId")
  .get(validate(userValidation.getUser), userController.getUser);



module.exports = router;
