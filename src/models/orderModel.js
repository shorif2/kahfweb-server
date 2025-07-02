const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      require: true,
    },
    itemName: {
      type: String,
    },
    item: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
    domain: {
      type: String,
      require: true,
    },
    orderDate: {
      type: String,
    },
    expiryDate: {
      type: String,
    },
    status: {
      type: String,
      default: "pending",
    },
    paymentMethod: {
      type: String,
    },
    transactionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const orderModel =
  mongoose.models.Orders || mongoose.model("Orders", orderSchema);
module.exports = orderModel;
