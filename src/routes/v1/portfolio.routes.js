const express = require("express");
const auth = require("../../middlewares/auth");
const portfolioController = require("../../controllers/portfolio.controller");
const userFileUploadMiddleware = require("../../middlewares/fileUpload");
const UPLOADS_FOLDER_PORTFOLIO = "./public/uploads/portfolio";

const uploadPortfolio = userFileUploadMiddleware(UPLOADS_FOLDER_PORTFOLIO);

const router = express.Router();

router
  .route("/")
  .post(
    auth("freelancer"),
    [uploadPortfolio.single("image")],
    portfolioController.createPortfolio
  )
  .get(portfolioController.getPortfolios);

router
  .route("/:portfolioId")
  .delete(auth("freelancer"), portfolioController.deletePortfolioById);

module.exports = router;
