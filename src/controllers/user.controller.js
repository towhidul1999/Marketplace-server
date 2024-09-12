const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { userService } = require("../services");

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).json(
    response({
      message: "User Created",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: user,
    })
  );
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["fullName", "role", "username", "email"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await userService.queryUsers(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "All Users",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const getUser = catchAsync(async (req, res) => {
  let user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.status(httpStatus.OK).json(
    response({
      message: "User",
      status: "OK",
      statusCode: httpStatus.OK,
      data: { user },
    })
  );
});

const updateUser = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const updatedUserData = req.body; // Directly assign req.body to updatedUserData

  // Update user data
  const user = await userService.updateUserById(userId, updatedUserData);

  // Send response
  res.status(httpStatus.OK).json(
    response({
      message: "User Updated",
      status: "OK",
      statusCode: httpStatus.OK,
      data: user,
    })
  );
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.OK).json(
    response({
      message: "User Deleted",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

const allUsers = catchAsync(async (req, res) => {
  const users = await userService.allUsers();
  res.status(httpStatus.OK).json(
    response({
      message: "All Users",
      status: "OK",
      statusCode: httpStatus.OK,
      data: users,
    })
  );
});

const updateProfileImage = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.image = "/uploads/users/" + req.file.filename;
  }

  const user = await userService.updateUserById(req.user.id, req.body);
  res.status(httpStatus.OK).json(
    response({
      message: "Profile Image Updated",
      status: "OK",
      statusCode: httpStatus.OK,
      data: user,
    })
  );
});

const updateCoverImage = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.coverImage = "/uploads/users/" + req.file.filename;
  }

  const user = await userService.updateUserById(req.user.id, req.body);
  res.status(httpStatus.OK).json(
    response({
      message: "Cover Image Updated",
      status: "OK",
      statusCode: httpStatus.OK,
      data: user,
    })
  );
});
const getUsersPublicById = catchAsync(async (req, res) => {
  const user = await userService.getUsersPublicById(req.query.userId);
  res.status(httpStatus.OK).json(
    response({
      message: "User",
      status: "OK",
      statusCode: httpStatus.OK,
      data: { user },
    })
  );
});

const getUserStats = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const stats = await userService.getUserStats(userId);
  res.status(httpStatus.OK).json(
    response({
      message: "User Stats",
      status: "OK",
      statusCode: httpStatus.OK,
      data: stats,
    })
  );
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  allUsers,
  updateProfileImage,
  getUsersPublicById,
  updateCoverImage,
  getUserStats,
};
