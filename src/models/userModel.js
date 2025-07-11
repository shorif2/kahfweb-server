const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    phone: { type: String, require: true },
    password: {
      type: String,
      require: true,
    },
    status: {
      type: String,
      default: "active",
    },
    role: {
      type: String,
      default: "user",
      enum: ["admin", "manager", "user"],
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      require: true,
    },
    notes: {
      type: String,
      default: "N/A",
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
const userModal =
  mongoose.models.user || mongoose.model("users", userSchema, "users");
module.exports = userModal;
