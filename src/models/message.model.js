const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const offerSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gig",
    required: false,
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  gigTitle: {
    type: String,
    required: false,
  },
  slug: {
    type: String,
    required: false,
  },
  description: { type: String, required: false },
  deliveryTime: { type: Number, required: false },
  revisionDays: { type: Number, default: 0 },
  price: { type: Number, required: false },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  expiration: { type: Number, default: 1 },
  orderId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: false,
  }
});
const messageSchema = mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
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
          "offer",
        ],
        required: false,
      },
      message: { type: String, required: false },
      files: {
        type: Array,
        default: [],
      },
      offerDetails: offerSchema,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: false,
    },
    deletedBy: {
      type: Array,
      default: [],
    },
    readed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.plugin(toJSON);
messageSchema.plugin(paginate);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
