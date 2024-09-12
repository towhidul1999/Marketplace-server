const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { toJSON, paginate } = require("./plugins");
const { roles } = require("../config/roles");

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    gender: {
      type: String,
      required: false,
      enum: ["Male", "Female", "Other"],
    },
    username: {
      type: String,
      unique: true,
      trim: true,
      required: false,
      minLength: 3,
      maxLength: 24,
    },
    image: {
      type: String,
      required: [true, "Image is must be Required"],
      default: `/uploads/users/user.png`,
    },
    coverImage: {
      type: String,
      required: false,
      default: `/uploads/covers/cover.jpg`,
    },
    location: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    password: {
      type: String,
      required: false,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      enum: roles,
      default: "freelancer",
    },
    intro: {
      type: String,
      required: false,
      default: "",
    },
    about: {
      type: String,
      required: false,
      default: "",
    },
    balance: {
      type: Number,
      required: false,
      default: 0,
    },
    skills: {
      type: [],
      required: false,
      default: [],
    },
    online: {
      type: Boolean,
      default: false,
    },
    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isResetPassword: {
      type: Boolean,
      default: false,
    },
    perHourRate: {
      type: String,
      required: false,
      default: "",
    },
    responseTime: {
      type: String,
      required: false,
      default: 0,
    },
    oneTimeCode: {
      type: String,
      required: false,
    },
    language: {
      type: String,
      required: false,
      default: "English",
    },
    review: {
      rating: {
        type: Number,
        required: false,
        default: 0.0,
      },
      total: {
        type: Number,
        required: false,
        default: 0.0,
      },
    },
    isDeleted: { type: Boolean, default: false },
    isBan: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};
userSchema.statics.isPhoneNumberTaken = async function (
  phoneNumber,
  excludeUserId
) {
  const user = await this.findOne({ phoneNumber, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model("User", userSchema);

module.exports = User;
