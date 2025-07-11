const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const authorizedRoles = require("../middlewares/roleMiddleware");
const pricingModel = require("../models/pricingModel");

const router = express.Router();

// Get all pricing packages (admin only)
router.get("/", async (req, res) => {
  try {
    const pricingPackages = await pricingModel.find().sort({ packageType: 1 });
    res.json({ success: true, data: pricingPackages });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pricing packages",
      error: error.message,
    });
  }
});

// Get active pricing packages (public)
router.get("/active", async (req, res) => {
  try {
    const pricingPackages = await pricingModel
      .find({ isActive: true })
      .sort({ packageType: 1 });
    res.json({ success: true, data: pricingPackages });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pricing packages",
      error: error.message,
    });
  }
});

// Create new pricing package (admin only)
router.post("/", async (req, res) => {
  try {
    const {
      packageType,
      title,
      price,
      period,
      isPopular,
      features,
      buttonText,
    } = req.body;

    if (!packageType || !title || !price || !buttonText) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if package type already exists
    const existingPackage = await pricingModel.findOne({ packageType });
    if (existingPackage) {
      return res.status(400).json({
        success: false,
        message: "Package type already exists",
      });
    }

    const newPricingPackage = new pricingModel({
      packageType,
      title,
      price,
      period: period || "year",
      isPopular: isPopular || false,
      features: features || [],
      buttonText,
    });

    await newPricingPackage.save();

    res.status(201).json({
      success: true,
      data: newPricingPackage,
      message: "Pricing package created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create pricing package",
      error: error.message,
    });
  }
});

// Update pricing package (admin only)
router.patch("/:packageId", async (req, res) => {
  try {
    const packageId = req.params.packageId;
    const updateData = req.body;

    const updatedPackage = await pricingModel.findByIdAndUpdate(
      packageId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: "Pricing package not found",
      });
    }

    res.json({
      success: true,
      data: updatedPackage,
      message: "Pricing package updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update pricing package",
      error: error.message,
    });
  }
});

// Toggle pricing package status (admin only)
router.patch("/toggle/:packageId", async (req, res) => {
  try {
    const updatedPackage = await pricingModel.findByIdAndUpdate(
      req.params.packageId,
      [{ $set: { isActive: { $not: "$isActive" } } }],
      { new: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: "Pricing package not found",
      });
    }

    res.json({
      success: true,
      data: updatedPackage,
      message: `Pricing package ${
        updatedPackage.isActive ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle pricing package status",
      error: error.message,
    });
  }
});

// Delete pricing package (admin only)
router.delete(
  "/:packageId",
  verifyToken,
  authorizedRoles("admin"),
  async (req, res) => {
    try {
      const packageId = req.params.packageId;
      const deletedPackage = await pricingModel.findByIdAndDelete(packageId);

      if (!deletedPackage) {
        return res.status(404).json({
          success: false,
          message: "Pricing package not found",
        });
      }

      res.json({
        success: true,
        data: deletedPackage,
        message: "Pricing package deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete pricing package",
        error: error.message,
      });
    }
  }
);

module.exports = router;
