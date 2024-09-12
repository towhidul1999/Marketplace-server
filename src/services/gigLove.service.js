const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { GigLove } = require("../models");

const gigLove = async (gigId, userId) => {
  const gigLoveCheck = await GigLove.findOne({ gigId, userId });
  if (gigLoveCheck) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Gig already loved");
  }
  const gigLove = await GigLove.create({
    gigId,
    userId,
  });
  return gigLove;
};

const gigUnlove = async (gigId, userId) => {
  const gigLoveCheck = await GigLove.findOne({ gigId, userId });
  if (!gigLoveCheck) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Gig not found");
  }
  const gigUnlove = await GigLove.findOneAndDelete({ gigId, userId });
  return gigUnlove;
};

const gigLoveList = async (filter, options,userId) => {
  if (userId) {
    filter.userId = userId;
  }
  options.populate = [
    { 
      path: "gigId",
      populate:{
        path: "userId"
      }
    }
  ];

  const result = await GigLove.paginate(filter, options);
  return result;
};

module.exports = {
  gigLove,
  gigUnlove,
  gigLoveList,
};
