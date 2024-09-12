const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const categoriesSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
categoriesSchema.plugin(toJSON);
categoriesSchema.plugin(paginate);

const Categories = mongoose.model("Categories", categoriesSchema);

module.exports = Categories;
