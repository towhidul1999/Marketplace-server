const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");
const { userService } = require(".");
const { addCustomNotification } = require("./notification.service");
const { Withdrawal } = require("../models");

const createWithdrawal = async (userId, body) => {
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (body.withdrawalAmount < 20) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Minimum withdrawal amount is 20"
    );
  }
  if (body.withdrawalAmount > 10000) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Maximum withdrawal amount is 10000"
    );
  }

  if (user.balance < body.withdrawalAmount) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient balance");
  }
  user.balance = user.balance - body.withdrawalAmount;
  await user.save();

  const withdrawal = await Withdrawal.create({ ...body, userId });

  const newNotificationAdmin = {
    role: "admin",
    message: `${user.fullName} has sent withdrawn request $${body.withdrawalAmount}.`,
  };

  await addCustomNotification(
    "admin-notification",
    "admin",
    newNotificationAdmin
  );

  return { withdrawal, user };
};

const withdrawalCancel = async (withdrawalId) => {
  const withdrawal = await Withdrawal.findOne({ _id: withdrawalId });
  const user = await userService.getUserById(withdrawal?.userId);
  if (withdrawal.status === "Completed") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Withdrawal already completed");
  }
  if (!withdrawal) {
    throw new ApiError(httpStatus.NOT_FOUND, "Withdrawal not found");
  }
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  const newNotificationFreelancer = {
    receiverId: withdrawal.userId,
    role: "freelancer",
    message: `Your withdrawal $${withdrawal.withdrawalAmount} has been cancelled.`,
  };

  await addCustomNotification(
    "freelancer-notification",
    withdrawal.userId,
    newNotificationFreelancer
  );

  withdrawal.status = "Failed";
  user.balance = user.balance + withdrawal.withdrawalAmount;
  await user.save();
  await withdrawal.save();
  return withdrawal;
};

const queryWithdrawals = async (status, filter, providedOptions) => {
  if (status) {
    filter.status = status;
  }

  // Merge provided options with default options
  const options = Object.assign(
    {
      sortBy: "createdAt:desc",
      limit: 10,
      page: 1,
      populate: "userId", // Populate the userId field
    },
    providedOptions
  );

  // Call Withdrawal.paginate() with provided filter and options
  const withdrawals = await Withdrawal.paginate(filter, options);
  return withdrawals;
};

const getSingleUserWithdrawals = async (userId) => {
  const withdrawals = await Withdrawal.find({ userId })
    .populate("userId", "email fullName image role")
    .sort({ createdAt: -1 });
  return withdrawals;
};

const withdrawalApprove = async (withdrawalId) => {
  const withdrawal = await Withdrawal.findOne({ _id: withdrawalId });
  const user = await userService.getUserById(withdrawal?.userId);
  if (withdrawal.status === "Completed") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Withdrawal already completed");
  }
  if (!withdrawal) {
    throw new ApiError(httpStatus.NOT_FOUND, "Withdrawal not found");
  }
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  const newNotificationFreelancer = {
    receiverId: withdrawal.userId,
    role: "freelancer",
    message: `Your withdrawal $${withdrawal.withdrawalAmount} has been Completed.`,
  };

  await addCustomNotification(
    "freelancer-notification",
    withdrawal.userId,
    newNotificationFreelancer
  );
  withdrawal.status = "Completed";
  await withdrawal.save();
  return withdrawal;
};

const getSingleWithdrawal = async (withdrawalId) => {
  const withdrawal = await Withdrawal.findOne({ _id: withdrawalId }).populate(
    "userId",
    "email fullName image role"
  );
  return withdrawal;
};

module.exports = {
  createWithdrawal,
  queryWithdrawals,
  withdrawalCancel,
  getSingleUserWithdrawals,
  withdrawalApprove,
  getSingleWithdrawal,
};
