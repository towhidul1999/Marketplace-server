const catchAsync = require("../utils/catchAsync");
const adminService = require("../services/admin.service");
const response = require("../config/response");
const httpStatus = require("http-status");
const pick = require("../utils/pick");

const getTotalStatus = catchAsync(async (req, res, next) => {
  const result = await adminService.getTotalStatus();
  res.status(httpStatus.OK).json(
    response({
      message: "Total Status Retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const getIncomeRatio = catchAsync(async (req, res, next) => {
  const { year } = pick(req.query, ["year"]);
  if (!year) {
    return res.status(httpStatus.BAD_REQUEST).json(
      response({
        message: "Year query parameter is required",
        status: "BAD_REQUEST",
        statusCode: httpStatus.BAD_REQUEST,
        data: null,
      })
    );
  }
  const result = await adminService.getIncomeRatio(year);
  res.status(httpStatus.OK).json(
    response({
      message: "Income Ratio Retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const getUserRatio = catchAsync(async (req, res, next) => {
  const { month } = pick(req.query, ["month"]);
  const result = await adminService.getUserRatio(month);
  res.status(httpStatus.OK).json(
    response({
      message: "User Ratio Retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const getRecentUsers = catchAsync(async (req, res, next) => {
  const filter = pick(req.query, ["fullName","role","username","email"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await adminService.getRecentUsers(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "Recent Users Retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
})
const getAllEarning = catchAsync(async (req, res, next) => {
  const filter = pick(req.query, ["userName", "date"]);
  const options = pick(req.query, ["sortBy", "limit", "page", "populate"]);
  const result = await adminService.queryEarning(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "All Earning Retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

module.exports = {
  getTotalStatus,
  getIncomeRatio,
  getUserRatio,
  getRecentUsers,
  getAllEarning,
};
