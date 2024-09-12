const httpStatus = require("http-status");
const { User } = require("../models");
const ApiError = require("../utils/ApiError");
const { sendEmailVerification } = require("./email.service");
const mongoose = require("mongoose");
const Payment = require("../models/payment.model");

const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  const oneTimeCode =
    Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

  if (userBody.role === "buyer" || userBody.role === "freelancer") {
    sendEmailVerification(userBody.email, oneTimeCode);
  }
  return User.create({ ...userBody, oneTimeCode });
};

const queryUsers = async (filter, options) => {
  const query = {};
  // Loop through each filter field and add conditions if they exist
  for (const key of Object.keys(filter)) {
    if (
      (key === "fullName" || key === "email" || key === "username") &&
      filter[key] !== ""
    ) {
      query[key] = { $regex: filter[key], $options: "i" }; // Case-insensitive regex search for name
    } else if (filter[key] !== "") {
      query[key] = filter[key];
    }
  }
  const users = await User.paginate(query, options);
  return users;
};

const getUserById = async (id) => {
  return User.findById(id);
};

const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

const updateUserById = async (userId, updateBody, image) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  await user.remove();
  return user;
};

const isUpdateUser = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const oneTimeCode =
    Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  const annualIncome = updateBody.income * 12;

  if (updateBody.role === "buyer" || updateBody.role === "freelancer") {
    sendEmailVerification(updateBody.email, oneTimeCode);
  }

  Object.assign(user, updateBody, {
    isDeleted: false,
    isSuspended: false,
    isEmailVerified: false,
    isResetPassword: false,
    isPhoneNumberVerified: false,
    oneTimeCode: oneTimeCode,
    annualIncome: annualIncome,
  });
  await user.save();
  return user;
};

const getUsersPublicById = async (userId) => {
  const user = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "gigs",
        localField: "_id",
        foreignField: "userId",
        as: "gigs",
      },
    },
    {
      $lookup: {
        from: "portfolios",
        localField: "_id",
        foreignField: "userId",
        as: "portfolios",
      },
    },
    {
      $lookup: {
        from: "reviews",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$freelancerId", "$$userId"] },
            },
          },
        ],
        as: "reviews",
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        gender: 1,
        username: 1,
        image: 1,
        location: 1,
        role: 1,
        intro: 1,
        about: 1,
        balance: 1,
        skills: 1,
        online: 1,
        isProfileCompleted: 1,
        isEmailVerified: 1,
        perHourRate: 1,
        responseTime: 1,
        language: 1,
        review: 1,
        gigs: 1,
        portfolios: 1,
        reviews: { $ifNull: ["$reviews", []] }, // Ensure reviews is an empty array if null
      },
    },
  ]);

  return user[0]; // Return the first (and only) result
};

const getUserStats = async (freelancerId) => {
  try {
    // Aggregate completed orders and count unique buyers
    const stats = await Payment.aggregate([
      {
        // Match orders by freelancerId and status as 'delivery'
        $match: {
          freelancerId: freelancerId,
          "data.object.payment_status": "paid",
          "data.object.metadata.deliveryDate": { $ne: null },
        },
      },
      {
        // Group by clientId to get the count of unique buyers and completed orders
        $group: {
          _id: null,
          completedOrdersCount: { $sum: 1 }, // Count completed orders
          uniqueBuyers: { $addToSet: "$clientId" }, // Add unique client IDs
        },
      },
      {
        // Project the final output
        $project: {
          _id: 0,
          completedOrdersCount: 1,
          uniqueBuyersCount: { $size: "$uniqueBuyers" }, // Get the size of the unique buyer set
        },
      },
    ]);

    if (stats.length > 0) {
      return stats[0]; // Return the first result
    }

    // If no stats found, return default counts
    return {
      completedOrdersCount: 0,
      uniqueBuyersCount: 0,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw new Error("Could not fetch user stats");
  }
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  isUpdateUser,
  getUsersPublicById,
  getUserStats,
};
