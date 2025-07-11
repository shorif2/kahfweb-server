const mongoose = require("mongoose");

const pricingFeatureSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
});

const pricingPackageSchema = new mongoose.Schema(
  {
    packageType: {
      type: String,
      required: true,
      enum: ["domain", "bundle", "hosting"],
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    period: {
      type: String,
      required: true,
      default: "year",
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    features: [pricingFeatureSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("PricingPackage", pricingPackageSchema);
