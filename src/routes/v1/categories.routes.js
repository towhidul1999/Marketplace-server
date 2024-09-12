const express = require("express");
const auth = require("../../middlewares/auth");
const categoriesController = require("../../controllers/categories.controller");
const userFileUploadMiddleware = require("../../middlewares/fileUpload");
const convertHeicToPngMiddleware = require("../../middlewares/converter");
const UPLOADS_FOLDER_CATEGORIES = "./public/uploads/categories";

const uploadCategories = userFileUploadMiddleware(UPLOADS_FOLDER_CATEGORIES);

const router = express.Router();

router
  .route("/")
  .post(
    auth("admin"),
    [uploadCategories.single("image")],
    convertHeicToPngMiddleware(UPLOADS_FOLDER_CATEGORIES),
    categoriesController.createCategory
  )
  .patch(
    auth("admin"),
    [uploadCategories.single("image")],
    convertHeicToPngMiddleware(UPLOADS_FOLDER_CATEGORIES),
    categoriesController.updateCategory
  )
  .get(categoriesController.getCategories)
router.route("/:categoryId").get(categoriesController.getCategory)
.delete(auth("admin"),categoriesController.deleteCategory)

module.exports = router;
