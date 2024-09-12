const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");
const Payment = require("../models/payment.model");
const Orders = require("../models/orders.model");

const orderCreate = async (body, clientId) => {
  const newBody = {
    ...body,
    clientId,
  };
  const order = Orders.create(newBody);
  return order;
};

const getOrders = async (filter, options, userId) => {
  filter.clientId = userId;
  options.populate = [
    {
      path: "gigId",
    },
    {
      path: "freelancerId",
    },
    {
      path: "clientId",
    },
  ];

  // Retrieve the paginated orders
  const orders = await Orders.paginate(filter, options);

  return orders;
};

const getOrderById = async (orderId) => {
  const order = await Payment.findById(orderId).populate(
    "gigId freelancerId clientId"
  );
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  return order;
};
const freelancerOrdersList = async (filter, options, userId) => {
  filter.freelancerId = userId;
  options.populate = [
    {
      path: "gigId",
    },
    {
      path: "freelancerId",
    },
    {
      path: "clientId",
    },
  ];

  // Retrieve the paginated orders
  const orders = await Payment.paginate(filter, options);

  return orders;
};

const createOrderRequest = async (body) => {
  const order = Orders.create(body);
  return order;
};

const getMyOrders = async (filter, options, userId) => {
  options.populate = [
    {
      path: "gigId",
    },
    {
      path: "freelancerId",
    },
    {
      path: "clientId",
    },
  ];

  filter.clientId = userId;
  // Retrieve the paginated orders
  const orders = await Payment.paginate(filter, options);

  return orders;
};

const orderModify = async (paymentId, body, userId) => {
  const order = await Payment.findById(paymentId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }
  Object.assign(order, body);
  await order.save();
  if (order.status === "delivered") {
    const updatedFreelancer = await User.findByIdAndUpdate(
      order.freelancerId,
      { $inc: { balance: order?.items[0]?.price } },
      { new: true }
    );
    if (!updatedFreelancer) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to update freelancer balance"
      );
    }
  }
  return order;
};

module.exports = {
  orderCreate,
  getOrders,
  createOrderRequest,
  getMyOrders,
  getOrderById,
  orderModify,
  freelancerOrdersList,
};
