const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const gigLoveSchema = mongoose.Schema(
  {
    gigId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Gig",
      required: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
gigLoveSchema.plugin(toJSON);
gigLoveSchema.plugin(paginate);

const GigLove = mongoose.model("GigLove", gigLoveSchema);

module.exports = GigLove;
