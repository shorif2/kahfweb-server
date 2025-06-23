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
router.post(
  "/",
  verifyToken,
  // authorizedRoles("admin, user"),
  async (req, res) => {
    try {
      const {
        userId,
        itemName,
        item,
        price,
        domain,
        expiryDate,
        orderDate,
        paymentMethod,
        transactionId,
      } = req.body;

      if (!userId || !item || !price) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      const newOrder = new OrderModel({
        userId: new mongoose.Types.ObjectId(userId),
        itemName: itemName || "N/A",
        domain,
        item,
        price,
        expiryDate: expiryDate || "N/A",
        orderDate: orderDate || "N/A",
        paymentMethod: paymentMethod || "N/A",
        transactionId: transactionId || "N/A",
      });

      await newOrder.save();

      res.status(201).json({
        message: "Order created successfully",
        order: newOrder,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Something went wrong ${error.message}` });
    }
  }
);
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
// summary
router.get("/summary", async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 15);

    const [totalUsers, activeDomains, activeHostings, allOrders] =
      await Promise.all([
        userModal.countDocuments(),
        OrderModel.countDocuments({ item: "domain", status: "active" }),
        OrderModel.countDocuments({ item: "hosting", status: "active" }),
        OrderModel.find()
          .select("-__v")
          .populate("userId", "-password -__v -createdAt -updatedAt"),
      ]);

    // Manually filter orders that expire within 30 days
    const expireSoon = allOrders.filter((order) => {
      if (!order.expiryDate) return false;
      const expireDate = new Date(order.expiryDate);
      return expireDate >= now && expireDate <= sevenDaysLater;
    });

    res.status(200).json({
      totalUsers,
      activeDomains,
      activeHostings,
      totalExpireSoon: expireSoon.length,
      expireSoon,
    });
  } catch (error) {
    console.error("Error generating summary:", error.message);
    res.status(500).json({ message: "Failed to generate summary." });
  }
});

//traking new order
router.get("/recent-orders", async (req, res) => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const orders = await OrderModel.find({ createdAt: { $gte: threeDaysAgo } })
      .select("-__v")
      .populate("userId", "-password -__v -createdAt -updatedAt");

    const formattedOrders = orders.map((order) => {
      const orderObj = order.toObject();
      const { userId, ...rest } = orderObj;

      return {
        ...rest,
        user: userId,
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

router.patch("/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;
    console.log(orderId);
    // Optional: Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const updates = req.body;

    const updateOrder = await OrderModel.findOneAndUpdate(
      { _id: orderId },
      { $set: updates },
      {
        new: true,
        runValidators: true,
        fields: "-password -__v -createdAt -updatedAt",
      }
    );

    if (!updateOrder) {
      return res.status(404).json({ error: "order not found not found" });
    }

    res.json({ success: true, order: updateOrder });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
