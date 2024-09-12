const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const chatSchema = mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
    status: {
      type: String,
      enum: ["accepted", "blocked"],
      default: "accepted",
    },
    deletedBy: {
      type: Array,
      default: [],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
chatSchema.plugin(toJSON);
chatSchema.plugin(paginate);

const chat = mongoose.model("Chat", chatSchema);

module.exports = chat;
