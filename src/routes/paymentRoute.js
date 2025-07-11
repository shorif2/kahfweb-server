const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const authorizedRoles = require("../middlewares/roleMiddleware");

const paymentModel = require("../models/paymentModel");

const router = express.Router();

// Only admin can acess this router
router.get("/", verifyToken, authorizedRoles("admin"), async (req, res) => {
  try {
    const paymentMethod = await paymentModel.find();
    res.json({ success: true, data: paymentMethod });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "PaymentMethod Ritive Failed!",
      error: err,
    });
  }
});

router.get("/active", async (req, res) => {
  try {
    const paymentMethod = await paymentModel.find({ isActive: true });

    res.json({ success: true, data: paymentMethod });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "PaymentMethod Ritive Failed!",
      error: err,
    });
  }
});

router.post(
  "/",
  verifyToken,
  authorizedRoles("admin", "manager"),

  async (req, res) => {
    try {
      const { qrCode, logo } = req.body;

      if (!qrCode && !logo) {
        return res
          .status(400)
          .json({ success: false, message: "No qrCode or logo provided" });
      }

      const newPaymentMethod = new paymentModel(req.body);
      await newPaymentMethod.save();

      res.status(201).json({ success: true, data: newPaymentMethod });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Upload failed", error: err });
    }
  }
);

router.patch(
  "/:methodId",
  verifyToken,
  authorizedRoles("admin", "manager"),

  async (req, res) => {
    try {
      const methodId = req.params.methodId;
      console.log(req.params);
      const newPaymentMethod = await paymentModel.findByIdAndUpdate(
        methodId,
        req.body,
        { new: true }
      );

      res.status(201).json({ success: true, data: newPaymentMethod });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Upload failed", error: err });
    }
  }
);
// toggle payment method status
router.patch(
  "/update/:methodId",
  verifyToken,
  authorizedRoles("admin", "manager"),
  async (req, res) => {
    try {
      const updatedMethod = await paymentModel.findByIdAndUpdate(
        req.params.methodId,
        [{ $set: { isActive: { $not: "$isActive" } } }],
        { new: true }
      );

      if (!updatedMethod) {
        return res.status(404).json({
          success: false,
          message: "Payment method not found",
        });
      }

      res.status(200).json({
        success: true,
        data: updatedMethod,
        message: `Payment method ${
          updatedMethod.isActive ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Status update failed", error: err });
    }
  }
);

router.delete(
  "/:methodId",
  verifyToken,
  authorizedRoles("admin", "manager"),

  async (req, res) => {
    try {
      const methodId = req.params.methodId;

      const newPaymentMethod = await paymentModel.findByIdAndDelete(methodId);
      console.log(methodId);
      res.status(201).json({ success: true, data: newPaymentMethod });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Upload failed", error: err });
    }
  }
);

module.exports = router;
