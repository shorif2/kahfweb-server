const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const authorizedRoles = require("../middlewares/roleMiddleware");
const userModal = require("../models/userModel");
const mongoose = require("mongoose");
const orderModel = require("../models/orderModel");
const router = express.Router();

// Only admin can acess this router
router.get("/", verifyToken, authorizedRoles("admin"), (req, res) => {
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

module.exports = router;
