const express = require("express");
const auth = require("../../middlewares/auth");
const gigController = require("../../controllers/gig.controller");
const gigLoveController = require("../../controllers/gigLove.controller");
const userFileUploadMiddleware = require("../../middlewares/fileUpload");
const UPLOADS_FOLDER_GIGS = "./public/uploads/gigs";

const uploadGigs = userFileUploadMiddleware(UPLOADS_FOLDER_GIGS);

const router = express.Router();

router
  .route("/love")
  .post(auth("buyer"), gigLoveController.gigLove)
  .put(auth("buyer"), gigLoveController.gigUnlove)
  .get(auth("buyer"), gigLoveController.gigLoveList);
router.route("/public").get(gigController.publicGigs);
router
  .route("/image")
  .post(
    auth("freelancer"),
    [uploadGigs.array("images", 6)],
    gigController.gigImageUpload
  );
router
  .route("/")
  .post(
    auth("freelancer"),
    [uploadGigs.array("images", 6)],
    gigController.createGig
  )
  .delete(auth("freelancer"), gigController.gigSingleImageDelete)
  .get(gigController.getGigs);
router
  .route("/:gigId")
  .get(gigController.getGig)
  .patch(auth("freelancer"), gigController.updateGig)
  .delete(auth("freelancer"), gigController.deleteGig);
//   .patch(auth("freelancer"), [uploadGigs.array("images", 6)], gigController.updateGig);

module.exports = router;
