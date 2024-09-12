const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { infoService } = require("../services");

const createPrivacy = catchAsync(async (req, res) => {
    const privacy = await infoService.createPrivacy(req.body);
    res.status(httpStatus.CREATED).json(response({ message: "Privacy Created", status: "OK", statusCode: httpStatus.CREATED, data: privacy }));
});

const queryPrivacy = catchAsync(async (req, res) => {
    const result = await infoService.queryPrivacy();
    res.status(httpStatus.OK).json(response({ message: "Privacy", status: "OK", statusCode: httpStatus.OK, data: result }));
});

const createTerms = catchAsync(async (req, res) => {
    const terms = await infoService.createTerms(req.body);
    res.status(httpStatus.CREATED).json(response({ message: "Terms Created", status: "OK", statusCode: httpStatus.CREATED, data: terms }));
});

const queryTerms = catchAsync(async (req, res) => {
    const result = await infoService.queryTerms();
    res.status(httpStatus.OK).json(response({ message: "Terms", status: "OK", statusCode: httpStatus.OK, data: result }));
});

const createTrustSafety = catchAsync(async (req, res) => {
    const trustSafety = await infoService.createTrustSafety(req.body);
    res.status(httpStatus.CREATED).json(response({ message: "Trust & Safety Created", status: "OK", statusCode: httpStatus.CREATED, data: trustSafety }));
});

const queryTrustSafety = catchAsync(async (req, res) => {
    const result = await infoService.queryTrustSafety();
    res.status(httpStatus.OK).json(response({ message: "Trust & Safety", status: "OK", statusCode: httpStatus.OK, data: result }));
});



module.exports = {
    createPrivacy,
    queryPrivacy,
    createTerms,
    queryTerms,
    createTrustSafety,
    queryTrustSafety
};
