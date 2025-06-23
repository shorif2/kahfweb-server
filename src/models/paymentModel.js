const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema(
  {
    logo: {
      type: String,
      require: true,
    },
    isActive: {
      type: String,
      require: true,
    },
    currency: {
      type: String,
      require: true,
    },
    payAmount: {
      type: String,
      require: true,
    },
    instructions: {
      type: String,
      require: true,
    },
    accountNumber: {
      type: String,
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
