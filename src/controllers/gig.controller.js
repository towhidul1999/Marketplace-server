const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const he = require("he");
const { gigService } = require("../services");

const createGig = catchAsync(async (req, res) => {
  const { title, package, categoriesId, description, price } = req.body;

  // Parse JSON fields with error handling
  let parsedPackage;
  try {
    parsedPackage = JSON.parse(package);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON in package field");
  }

  // Treat description as a string
  const parsedDescription = he.decode(description);

  let imagesArray = [];

  if (!req.files) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Image is required");
  }

  if (req.files) {
    req.files.forEach((file) => {
      const image = "/uploads/gigs/" + file.filename;
      imagesArray.push(image);
    });
  }
  if (imagesArray.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Image is required");
  }

  const gigData = {
    title,
    package: parsedPackage,
    categoriesId,
    description: parsedDescription,
    price,
    images: imagesArray,
    userId: req.user.id,
  };

  if (title) {
    gigData.slug = title.toLowerCase().split(" ").join("-");
  }

  const gig = await gigService.createGig(gigData);
  res.status(httpStatus.CREATED).json(
    response({
      message: "Gig Created",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: gig,
    })
  );
});

const gigImageUpload = catchAsync(async (req, res) => {
  let image = "";
  if (req.files) {
    req.files.forEach((file) => {
      image = "/uploads/gigs/" + file.filename;
    });
  }
  const gig = await gigService.updateGigById(req.query.gigId, req.body, image);
  res.status(httpStatus.OK).json(
    response({
      message: "Gig Image Updated",
      status: "OK",
      statusCode: httpStatus.OK,
      data: gig,
    })
  );
});

const getGigs = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'title',
    'slug',
    'categories',
    'minPrice',
    'maxPrice'
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const result = await gigService.queryGigs(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: 'All Gigs',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: result
    })
  );
});

const getGig = catchAsync(async (req, res) => {
  let gig = await gigService.getGigById(req.params.gigId);
  if (!gig) {
    throw new ApiError(httpStatus.NOT_FOUND, "Gig not found");
  }
  res.status(httpStatus.OK).json(
    response({
      message: "Gig",
      status: "OK",
      statusCode: httpStatus.OK,
      data: { gig },
    })
  );
});

const getGigBySlug = catchAsync(async (req, res) => {
  let gig = await gigService.getGigBySlug(req.params.slug);
  if (!gig) {
    throw new ApiError(httpStatus.NOT_FOUND, "Gig not found");
  }
  res.status(httpStatus.OK).json(
    response({
      message: "Gig",
      status: "OK",
      statusCode: httpStatus.OK,
      data: { gig },
    })
  );
});

const updateGig = catchAsync(async (req, res) => {
  req.body.description = he.decode(req.body.description);

  const gig = await gigService.updateGigById(req.params.gigId, req.body);
  res.status(httpStatus.OK).json(
    response({
      message: "Gig Updated",
      status: "OK",
      statusCode: httpStatus.OK,
      data: gig,
    })
  );
});

const gigSingleImageDelete = catchAsync(async (req, res) => {
  const gig = await gigService.gigSingleImageDelete(
    req.query.gigId,
    req.query.imagePath
  );
  res.status(httpStatus.OK).json(
    response({
      message: "Gig Image Deleted",
      status: "OK",
      statusCode: httpStatus.OK,
      data: gig,
    })
  );
});

const deleteGig = catchAsync(async (req, res) => {
  await gigService.deleteGigById(req.params.gigId);
  res.status(httpStatus.OK).json(
    response({
      message: "Gig Deleted",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

const publicGigs = catchAsync(async (req, res) => {
  const result = await gigService.publicGigs(req.query.userId);
  res.status(httpStatus.OK).json(
    response({
      message: "All Gigs",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

module.exports = {
  createGig,
  getGigs,
  getGig,
  updateGig,
  deleteGig,
  gigImageUpload,
  getGigBySlug,
  gigSingleImageDelete,
  publicGigs,
};
