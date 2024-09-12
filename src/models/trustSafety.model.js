const mongoose = require("mongoose");

const trustSafety = new mongoose.Schema(
  {
    content: { type: String, required: [true, "Content is must be Required"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrustSafety", trustSafety);
