const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const authorizedRoles = require("../middlewares/roleMiddleware");
const userModal = require("../models/userModel");
const mongoose = require("mongoose");
const orderModel = require("../models/orderModel");
const router = express.Router();

// Only admin can acess this router
router.get("/admin", verifyToken, authorizedRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

// admin and manager
router.get(
  "/manager",
  verifyToken,
  authorizedRoles("admin", "manager"),
  (req, res) => {
    res.json({ message: "Welcome manager" });
  }
);

// get all user
router.get(
  "/all-user",
  // verifyToken,
  // authorizedRoles("admin"),
  async (req, res) => {
    try {
      const users = await userModal
        .find()
        .select("-password -createdAt -updatedAt -__v");

      if (!users) {
        return res.status(501).json({ error: `No user Found` });
      }

      const orders = await orderModel.aggregate([
        {
          $match: {
            item: { $in: ["domain", "hosting"] }, // Only domain and hosting
          },
        },
        {
          $group: {
            _id: { userId: "$userId", item: "$item" },
            count: { $sum: 1 },
          },
        },
      ]);
      const orderMap = new Map();
      orders.forEach((entry) => {
        const userId = entry._id.userId.toString();
        const item = entry._id.item;
        const count = entry.count;

        if (!orderMap.has(userId)) {
          orderMap.set(userId, { domain: 0, hosting: 0 });
        }
        orderMap.get(userId)[item] = count;
      });

      const enrichedUsers = users.map((user) => {
        const userObj = user.toObject();
        const counts = orderMap.get(user._id.toString()) || {
          domain: 0,
          hosting: 0,
        };
        return {
          ...userObj,
          domain: counts.domain,
          hosting: counts.hosting,
        };
      });

      res.status(200).json(enrichedUsers);
    } catch (error) {
      console.log(error.message);
      res.status(501).json({ error: `something went wront ${error.message}` });
    }
  }
);

// all can acccess this router
router.get(
  "/user",
  verifyToken,
  authorizedRoles("admin", "manager", "user"),
  async (req, res) => {
    const userId = req.user.id;

    const user = await userModal.findOne(
      {
        _id: new mongoose.Types.ObjectId(userId),
      },
      ["-password", "-createdAt", "-updatedAt", "-__v"]
    );
    if (!user) {
      res.status(501).json({ error: "user not found" });
    } else {
      res.json({ Success: true, user });
    }
  }
);

router.patch(
  "/user/:id",
  verifyToken,
  authorizedRoles("admin", "manager"),
  async (req, res) => {
    try {
      const userId = req.params.id;

      // Optional: Check if the ID is valid
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const updates = req.body;
      const updatedUser = await userModal.findByIdAndUpdate(
        userId,
        { $set: updates },
        {
          new: true,
          runValidators: true,
          fields: "-password -__v -createdAt -updatedAt",
        }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true, user: updatedUser });
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update user status
router.patch("/block-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    const updatedUser = await userModal.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      message: "User status updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update user status.", error: error.message });
  }
});

module.exports = router;
