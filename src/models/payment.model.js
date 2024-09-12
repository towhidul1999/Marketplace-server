const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const ordersSchema = mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    items: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        freelancerId: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
      },
    ],
    messageId: {
      type: String,
      required: false,
    },
    freelancerId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    clientId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    gigId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Gig",
    },
    data: {
      type: Object,
      required: true,
    },
    price: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["active", "late", "delivered", "cancelled"],
      default: "active",
    },
    deliveryDate: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ordersSchema.plugin(paginate);

const Payment = mongoose.model("Payment", ordersSchema);

module.exports = Payment;
