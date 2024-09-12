const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const inboxSchema = new mongoose.Schema(
  {
    ownersId: {
      type: [mongoose.ObjectId],
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      enum: ['private', 'group'],
      required: true,
      default: 'private',
    },
    archivedBy: {
      type: [mongoose.ObjectId],
      default: [],
    },
    unreadMessage: {
      type: Number,
      default: 0,
    },
    fileId: {
      type: String,
      default: null,
    },
    deletedBy: {
      type: [mongoose.ObjectId],
      default: [],
    },
    content: {
      from: {
        type: mongoose.ObjectId, // -> the sender's userId
        required: true,
      },
      senderName: {
        type: String,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      time: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
inboxSchema.plugin(toJSON);
inboxSchema.plugin(paginate);

const Inboxes = mongoose.model("Inboxes", inboxSchema);

module.exports = Inboxes;
