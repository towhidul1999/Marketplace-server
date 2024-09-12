const { default: mongoose } = require("mongoose");
const paginate = require("./plugins/paginate.plugin");
const orderMessageSchema = mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    content: {
      messageType: {
        type: String,
        enum: [
          "image",
          "application",
          "audio",
          "video",
          "unknown",
          "text",
          "deliveryMessage",
        ],
        required: false,
      },
      message: { type: String, required: false },
      files: [
        {
          path: { type: String, required: false },
          fileType: { type: String, required: false },
        },
      ],
      deliveryDetails: {
        type: Object,
        required: false,
        default: {},
      },
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

orderMessageSchema.plugin(paginate);

const OrderMessage = mongoose.model("OrderMessage", orderMessageSchema);
module.exports = OrderMessage;
