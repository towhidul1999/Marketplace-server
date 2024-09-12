const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { Token } = require("../models");
const {
  authService,
  tokenService,
  userService,
  emailService,
} = require("../services");
const ApiError = require("../utils/ApiError");

const register = catchAsync(async (req, res) => {
  function generateUsernameFromEmail(email) {
    const parts = email.split("@");
    let username = parts[0];
    username = username.replace(/\W/g, "_");
    return username;
  }
  req.body.username = generateUsernameFromEmail(req.body.email);

  const isUser = await userService.getUserByEmail(req.body.email);

  if (isUser && isUser.isEmailVerified === false) {
    const user = await userService.isUpdateUser(isUser.id, req.body);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.CREATED).json(
      response({
        message: "Thank you for registering. Please verify your email",
        status: "OK",
        statusCode: httpStatus.CREATED,
        data: {},
      })
    );
  } else if (isUser && isUser.isDeleted === false) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  } else if (isUser && isUser.isDeleted === true) {
    const user = await userService.isUpdateUser(isUser.id, req.body);
    const tokens = await tokenService.generateAuthTokens(user);

    res.status(httpStatus.CREATED).json(
      response({
        message: "Thank you for registering. Please verify your email",
        status: "OK",
        statusCode: httpStatus.CREATED,
        data: {},
      })
    );
  } else {
    const user = await userService.createUser(req.body);
    res.status(httpStatus.CREATED).json(
      response({
        message: "Thank you for registering. Please verify your email",
        status: "OK",
        statusCode: httpStatus.CREATED,
        data: {},
      })
    );
  }
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const isUser = await userService.getUserByEmail(email);
  // here we check if the user is in the database or not
  if (isUser?.isDeleted === true) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This Account is Deleted");
  }
  if (isUser?.isEmailVerified === false) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email not verified");
  }
  if (!isUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found with this email");
  }
  const user = await authService.loginUserWithEmailAndPassword(email, password);

  setTimeout(async () => {
    try {
      user.oneTimeCode = null;
      user.isResetPassword = false;
      await user.save();
      console.log("oneTimeCode reset to null after 3 minute");
    } catch (error) {
      ApiError;
      console.error("Error updating oneTimeCode:", error);
    }
  }, 180000);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).json(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      message: "Login Successful",
      data: { user, tokens },
    })
  );
});

const logout = catchAsync(async (req, res) => {
  const user = await authService.logout(req.body.refreshToken);
  res.status(httpStatus.OK).json(
    response({
      message: "Login Out Successful",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const user = await userService.getUserByEmail(req.body.email);
  if (!user) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "No users found with this email"
    );
  }
  // if(user.oneTimeCode === 'verified'){
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     "try 3 minute later"
  //   );
  // }
  // Generate OTC (One-Time Code)
  const oneTimeCode =
    Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

  // Store the OTC and its expiration time in the database
  user.oneTimeCode = oneTimeCode;
  user.isResetPassword = true;
  await user.save();

  //console.log("oneTimeCode", user);
  await emailService.sendResetPasswordEmail(req.body.email, oneTimeCode);
  res.status(httpStatus.OK).json(
    response({
      message: "Email Sent",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.password, req.body.email);
  res.status(httpStatus.OK).json(
    response({
      message: "Password Reset Successful",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user, req.body);
  res.status(httpStatus.OK).json(
    response({
      message: "Password Change Successful",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

const sendVerificationEmail = catchAsync(async (req, res,next) => {
  // const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  // await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  // res.status(httpStatus.OK).send();
});

const verifyEmail = catchAsync(async (req, res,next) => {
  const user = await authService.verifyEmail(req.body, req.query);
  const tokens = await tokenService.generateAuthTokens(user);

  res.status(httpStatus.OK).json(
    response({
      message: "Email Verified",
      status: "OK",
      statusCode: httpStatus.OK,
      data: { user, tokens },
    })
  );
  // res.status(httpStatus.OK).send();
});

const deleteMe = catchAsync(async (req, res,next) => {
  const user = await authService.deleteMe(req.body.password, req.user);
  res.status(httpStatus.OK).json(
    response({
      message: "Account Deleted",
      status: "OK",
      statusCode: httpStatus.OK,
      data: { user },
    })
  );
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  deleteMe,
  changePassword,
};
