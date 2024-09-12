const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const { ordersService } = require("../services");
const { Payment } = require("../models");
const mongoose = require("mongoose");
const messageService = require("../services/message.service");

const orderCreate = catchAsync(async (req, res) => {
  try {
    const metadata = {
      freelancerId: req.body.freelancerId,
      clientId: req.body.clientId,
      gigId: req.body.gigId,
      messageId: req.body.messageId || "",
      price: req.body.price,
      deliveryDate: req.body.deliveryDate,
    };

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        return {
          price_data: {
            currency: "USD",
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity,
        };
      }),
      metadata,
      success_url: "http://cnnctr.com.au/success",
      cancel_url: "http://cnnctr.com.au/cancel",
    });

    res.status(200).send({ url: session.url });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

const orderPlaced = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  try {
    let event;

    if (!endpointSecret) {
      throw new Error("Stripe webhook secret not configured.");
    }

    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    console.log("Webhook verified.");

    const data = event.data.object;
    const eventType = event.type;

    console.log(`Received event type: ${eventType}`);
    console.log(`Event data: ${JSON.stringify(data)}`);

    switch (eventType) {
      case "checkout.session.completed":
        const session = await stripe.checkout.sessions.retrieve(data.id, {
          expand: ["line_items"],
        });

        const sessionData = {
          sessionId: session.id,
          items: session.line_items.data.map((item) => ({
            name: item.description,
            price: item.amount_subtotal / item.quantity / 100,
            quantity: item.quantity,
          })),
          messageId: session.metadata.messageId,
          freelancerId: session.metadata.freelancerId,
          clientId: session.metadata.clientId,
          gigId: session.metadata.gigId,
          deliveryDate: session.metadata.deliveryDate,
          data: req.body.data,
        };

        // // Check and convert freelancerId to ObjectId
        // if (session.metadata.freelancerId && ObjectId.isValid(session.metadata.freelancerId)) {
        //   sessionData.freelancerId = ObjectId(session.metadata.freelancerId);
        // } else {
        //   // Handle invalid or missing freelancerId
        //   console.error('Invalid or missing freelancerId:', session.metadata.freelancerId);
        //   throw new Error('Invalid or missing freelancerId');
        // }
        // Save sessionData to database
        const order = new Payment(sessionData);
        await order.save();
        //when order is completed message id is accepted
        const messageId = session.metadata.messageId;
        if (messageId) {
          const message = await messageService.updateMessageStatus(
            messageId,
            "accepted",
            order?._id
          );
          if (!message) {
            throw new ApiError(httpStatus.NOT_FOUND, "Message not found.");
          }
        }
        break;
      default:
        // Handle other webhook events or errors as needed
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.send().end();
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

const createOrderRequest = catchAsync(async (req, res) => {
  const order = await ordersService.createOrderRequest(req.body);
  res.status(httpStatus.CREATED).json(
    response({
      message: "Order Request Created",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: order,
    })
  );
});

const getOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "status", "gender"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await ordersService.getOrders(filter, options, req.user.id);
  res.status(httpStatus.OK).json(
    response({
      message: "All Orders",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const getOrderById = catchAsync(async (req, res) => {
  const order = await ordersService.getOrderById(req.params.orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }
  res.status(httpStatus.OK).json(
    response({
      message: "Order",
      status: "OK",
      statusCode: httpStatus.OK,
      data: order,
    })
  );
});
const getMyOrders = catchAsync(async (req, res) => {
  console.log(req.user.id);
  const filter = pick(req.query, ["name", "status", "gender"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await ordersService.getMyOrders(filter, options, req.user.id);
  res.status(httpStatus.OK).json(
    response({
      message: "All Orders",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const orderModify = catchAsync(async (req, res) => {
  const userId = req?.user?.id
  const order = await ordersService.orderModify(req.query.orderId, req.body, userId);
  res.status(httpStatus.CREATED).json(
    response({
      message: "Order Modify",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: order,
    })
  );
});

const freelancerOrdersList = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "status", "gender"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await ordersService.freelancerOrdersList(
    filter,
    options,
    req.user.id
  );
  res.status(httpStatus.OK).json(
    response({
      message: "All Orders",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const myTotalIncome = catchAsync(async (req, res) => {
  const freelancerId = req.user.id;

  const result = await Payment.aggregate([
    {
      $match: {
        freelancerId: new mongoose.Types.ObjectId(freelancerId),
        status: "completed",
        isDeleted: false,
      },
    },
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $multiply: ["$items.price", "$items.quantity"] },
        },
      },
    },
  ]);

  const totalIncome = result.length > 0 ? result[0].totalIncome : 0;

  res.status(200).json({
    success: true,
    totalIncome,
  });
});

module.exports = {
  orderCreate,
  getOrders,
  createOrderRequest,
  orderPlaced,
  getMyOrders,
  orderModify,
  getOrderById,
  freelancerOrdersList,
  myTotalIncome,
};
