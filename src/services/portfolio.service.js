const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Portfolio } = require("../models");

const createPortfolio = async (body, userId) => {
  const portfolio = await Portfolio.create({ ...body, userId });
  return portfolio;
};

const getPortfolioById = async (userId) => {
  const portfolio = await Portfolio.find({ userId, isDeleted: false });
  if (!portfolio) {
    throw new ApiError(httpStatus.NOT_FOUND, "Portfolio not found");
  }
  return portfolio;
};

const deletePortfolioById = async (id) => {
  const portfolio = await Portfolio.findOneAndUpdate({ _id: id }, { isDeleted: true });
  if (!portfolio) {
    throw new ApiError(httpStatus.NOT_FOUND, "Portfolio not found");
  }

  return portfolio;
};

module.exports = {
  createPortfolio,
  getPortfolioById,
  deletePortfolioById,
};
