const express = require("express");
const auth = require("../../middlewares/auth");
const blogController = require("../../controllers/blog.controller");
const userFileUploadMiddleware = require("../../middlewares/fileUpload");
const convertHeicToPngMiddleware = require("../../middlewares/converter");
const UPLOADS_FOLDER_BLOGS = "./public/uploads/blogs";

const uploadUsers = userFileUploadMiddleware(UPLOADS_FOLDER_BLOGS);

const router = express.Router();

router
  .route("/")
  .get(blogController.getBlogs)
  .post(auth("admin"),
    [uploadUsers.single("image")],
    convertHeicToPngMiddleware(UPLOADS_FOLDER_BLOGS),
    blogController.createBlog
  );

router
  .route("/:blogId")
  .get(blogController.getBlog)
  .delete(auth("admin"),blogController.deleteBlog)
  .patch( auth("admin"),
    [uploadUsers.single("image")],
    convertHeicToPngMiddleware(UPLOADS_FOLDER_BLOGS),
    blogController.updateBlog
  );

router.route("/slug/:slug").get(blogController.slugBlog);

module.exports = router;
