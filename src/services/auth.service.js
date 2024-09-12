const httpStatus = require("http-status");
const tokenService = require("./token.service");
const userService = require("./user.service");
const Token = require("../models/token.model");
const ApiError = require("../utils/ApiError");
const { tokenTypes } = require("../config/tokens");

const loginSignup = async (body) => {
  if (!body.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is required");
  }
  const user = await userService.getUserByEmail(body.email);
  if (!user) {
    if (body.loginType === 0) {
      if (body.password) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Here Password is Not Allowed"
        );
      }
      function generateUsernameFromEmail(email) {
        const parts = email.split("@");
        let username = parts[0];
        username = username.replace(/\W/g, "_");
        return username;
      }
      body.username = generateUsernameFromEmail(body.email);
      const user = await userService.createUser(body);
      return user;
    }
    if (body.loginType === 1) {
      if (body.password) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Here Password is Not Allowed"
        );
      }
      function generateUsernameFromEmail(email) {
        const parts = email.split("@");
        let username = parts[0];
        username = username.replace(/\W/g, "_");
        return username;
      }
      body.username = generateUsernameFromEmail(body.email);
      const user = await userService.createUser(body);
      return user;
    }
    if (body.loginType === 2) {
      if (body.loginPassword) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Incorrect email or password"
        );
      }
      function generateUsernameFromEmail(email) {
        const parts = email.split("@");
        let username = parts[0];
        username = username.replace(/\W/g, "_");
        return username;
      }
      body.username = generateUsernameFromEmail(body.email);
      const user = await userService.createUser(body);
      return user;
    }
  } else {
    if (body.loginType === 0) {
      if (body.password) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Here Password is Not Allowed"
        );
      }
      return user;
    }
    if (body.loginType === 1) {
      if (body.password) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Here Password is Not Allowed"
        );
      }
      return user;
    }
    if (body.loginType === 2 && body.loginPassword) {
      if (!user || !(await user.isPasswordMatch(body.password))) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Incorrect email or password"
        );
      }
      return user;
    }
  }
};

const loginSignupEmail = async (body) => {
  if (!body.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is required");
  }
  const user = await userService.getUserByEmail(body.email);
  if (user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
  }

  if (body.loginType === 2) {
    function generateUsernameFromEmail(email) {
      const parts = email.split("@");
      let username = parts[0];
      username = username.replace(/\W/g, "_");
      return username;
    }
    body.username = generateUsernameFromEmail(body.email);
    const user = await userService.createUser(body);
    return user;
  }
};

const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService?.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }
  return user;
};

const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    // blacklisted: false,
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }
  await Token.deleteOne({ _id: refreshTokenDoc._id });
};

const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(
      refreshToken,
      tokenTypes.REFRESH
    );
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteOne({ _id: refreshTokenDoc._id });
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};

const resetPassword = async (newPassword, email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (await user.isPasswordMatch(newPassword)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "New password cannot be the same as old password"
    );
  }
  await userService.updateUserById(user.id, { password: newPassword });

  return user;
};

const changePassword = async (reqUser, reqBody) => {
  const { oldPassword, newPassword } = reqBody;
  const user = await userService.getUserByEmail(reqUser.email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (!(await user.isPasswordMatch(oldPassword))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Incorrect password");
  }
  if (await user.isPasswordMatch(newPassword)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "New password cannot be the same as old password"
    );
  }
  user.password = newPassword;
  await user.save();
  return user;
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (reqBody, reqQuery) => {
  const { email, oneTimeCode } = reqBody;
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not exist");
  } else if (user.oneTimeCode === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP expired");
  } else if (oneTimeCode != user.oneTimeCode) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  } else if (user.isEmailVerified && user.isResetPassword) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Reset password otp successfully verified"
    );
  } else if (user.isEmailVerified && !user.isResetPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already verified");
  } else {
    user.isEmailVerified = true;
    user.oneTimeCode = null;
    user.isResetPassword = false;
    await user.save();
    return user;
  }
};

const verifyNumber = async (phoneNumber, otpCode, email) => {
  console.log("reqBody", email);
  console.log("reqQuery", otpCode);
  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not exist");
  } else if (user.phoneNumberOTP === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP expired");
  } else if (otpCode != user.phoneNumberOTP) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  } else if (user.isPhoneNumberVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Phone Number already verified");
  } else {
    user.isPhoneNumberVerified = true;
    user.phoneNumberOTP = null;
    await user.save();
    return user;
  }
};

const deleteMe = async (password, reqUser) => {
  const user = await userService.getUserByEmail(reqUser.email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Incorrect password");
  }
  user.isDeleted = true;
  await user.save();
  return user;
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  deleteMe,
  changePassword,
  verifyNumber,
  loginSignup,
  loginSignupEmail,
};
