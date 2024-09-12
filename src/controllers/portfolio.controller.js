const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { portfolioService } = require("../services");

const getPortfolios = catchAsync(async (req, res) => {
  const portfolio = await portfolioService.getPortfolioById(req.query.userId);
  if (!portfolio) {
    throw new ApiError(httpStatus.NOT_FOUND, "Portfolio not found");
  }
  res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Portfolio",
        status: "OK",
        statusCode: httpStatus.OK,
        data: { portfolio },
      })
    );
});

const createPortfolio = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Image is required");
  }

  if (req.file) {
    req.body.image = "/uploads/portfolio/" + req.file.filename;
  }

  const portfolio = await portfolioService.createPortfolio(req.body, req.user.id);
  res
    .status(httpStatus.CREATED)
    .json(
      response({
        message: "Portfolio Created",
        status: "OK",
        statusCode: httpStatus.CREATED,
        data: portfolio,
      })
    );
});

const deletePortfolioById = catchAsync(async (req, res) => {
  await portfolioService.deletePortfolioById(req.params.portfolioId)
  res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Portfolio Deleted",
        status: "OK",
        statusCode: httpStatus.OK,
        data: {},
      })
    );
}); 

module.exports = {
  createPortfolio,
  getPortfolios,
  deletePortfolioById
};
