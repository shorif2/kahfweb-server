const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    require: true,
  },
  itemName: {
    type: String,
    require: true,
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
    unique: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    default: () => {
      const now = new Date();
      return new Date(now.setFullYear(now.getFullYear() + 1));
    },
  },
  status: {
    type: String,
    default: "pending",
  },
  paymentMethod: {
    type: String,
    require: true,
  },
  transactionId: {
    type: String,
    require: true,
  },
});

const orderModel =
  mongoose.models.Orders || mongoose.model("Orders", orderSchema);
module.exports = orderModel;
