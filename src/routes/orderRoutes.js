const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const authorizedRoles = require("../middlewares/roleMiddleware");
const userModal = require("../models/userModel");
const mongoose = require("mongoose");
const OrderModel = require("../models/orderModel");
const router = express.Router();

// Only admin can acess this router
router.get("/admin", verifyToken, authorizedRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

// order
router.post("/", verifyToken, authorizedRoles("user"), async (req, res) => {
  try {
    const { userId, itemName, item, price, domain } = req.body;

    if (!userId || !itemName || !item || !price) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newOrder = new OrderModel({
      userId: new mongoose.Types.ObjectId(userId),
      itemName,
      domain,
      item,
      price,
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ message: `Something went wrong ${error.message}` });
  }
});
// all can acccess this router
router.get("/user", async (req, res) => {
  try {
    const userId = req.query.id;
    if (!userId) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    const order = await OrderModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    return res.status(200).json({ orders: order });
  } catch (error) {
    return res.status(400).json({ message: "Missing required fields." });
  }
});
router.get("/all-orders", async (req, res) => {
  try {
    const orders = await OrderModel.find()
      .select("-__v")
      .populate("userId", "-password -__v -createdAt -updatedAt");

    // Transform each order: rename userId to user
    const formattedOrders = orders.map((order) => {
      const orderObj = order.toObject();
      const { userId, ...rest } = orderObj;

      return {
        ...rest,
        user: userId, // rename userId → user
      };
    });

    res.status(200).json({ orders: formattedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res
      .status(400)
      .json({ message: "Something went wrong while fetching orders." });
  }
});

module.exports = router;
