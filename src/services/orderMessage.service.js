const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const OrderMessage = require("../models/orderMessage.model");

const addOrderMessage = async (messageBody) => {
  try {
    return await OrderMessage.create(messageBody);
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, err.message);
  }
};
const getOrderMessages = async (orderId, options) => {
  const { limit = 50, page = 1 } = options;

  // Count all messages in the conversation
  const count = await OrderMessage.countDocuments({
    orderId,
  });

  const totalPages = Math.ceil(count / limit); // Calculate total pages
  const skip = (page - 1) * limit;

  // Find messages in the conversation excluding those marked as deleted by the user
  const messages = await OrderMessage.find({
    orderId,
  })
    .populate([
      { path: "sender", select: "fullName image email role online" },
      { path: "receiver", select: "fullName image email role online" },
    ])
    .skip(skip)
    .limit(limit);

  const result = {
    data: messages,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
    totalResults: count,
  };

  return result;
};
const getMessage = async (messageId) => {
  const message = await OrderMessage.findById(messageId).populate([
    { path: "sender", select: "fullName image email role online" },
    { path: "receiver", select: "fullName image email role online" },
  ]);
  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, "Message not found");
  }
  return message;
};
module.exports = {
  addOrderMessage,
  getOrderMessages,
  getMessage,
};
