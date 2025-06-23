const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema(
  {
    logo: {
      type: String,
      require: true,
    },
    isActive: {
      type: Boolean,
      require: true,
    },
    currency: {
      type: String,
      require: true,
    },
    payAmount: {
      type: Number,
      require: true,
    },
    instructions: {
      type: String,
      require: true,
    },
    accountNumber: {
      type: Number,
      require: true,
    },
    name: {
      type: String,
      require: true,
    },
    qrCode: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const paymentModel =
  mongoose.models.Orders || mongoose.model("Payment", paymentSchema);
module.exports = paymentModel;
