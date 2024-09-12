const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const gigSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
    categoriesId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Categories",
      required: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    package: {
      type: Array,
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
gigSchema.plugin(paginate);

const Gig = mongoose.model("Gig", gigSchema);

module.exports = Gig;
