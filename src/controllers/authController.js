const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { generateTokens } = require("../utils/authHandler");
const {
  sendPasswordResetEmail,
  sendPasswordChangeConfirmation,
} = require("../utils/emailService");

const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !phone || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const pass = password || "123456";
    // to do - check already user exist or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(500).json({ message: `User already exist` });
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: `User register successfully with username ${name}` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Something went wrong ${error.message}` });
  }
};

//login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with username ${email} not found` });
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentails" });
      } else {
        const { accessToken, refreshToken } = await generateTokens(user);
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: parseInt(process.env.ACCESS_TOKEN_MAX_AGE || "600000"),
        });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE || "3600000"),
        });

        const authUser = {
          _id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          email_verified: user.email_verified,
        };
        res.status(200).json({
          Success: true,
          message: "Successfully Login",
          user: authUser,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

//logOut
const logOut = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.status(200).json({ message: "Logout Successfull" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Forget Password
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:8080"
    }/reset-password/${resetToken}`;

    // Send email
    const emailSent = await sendPasswordResetEmail(email, resetToken, resetUrl);

    if (emailSent) {
      res.status(200).json({
        message:
          "Password reset email sent successfully. Please check your email.",
      });
    } else {
      res.status(500).json({ message: "Failed to send password reset email" });
    }
  } catch (error) {
    console.error("Forget password error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    await sendPasswordChangeConfirmation(user.email, user.name);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Change Password (for logged-in users)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Send confirmation email
    await sendPasswordChangeConfirmation(user.email, user.name);

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  login,
  register,
  logOut,
  forgetPassword,
  resetPassword,
  changePassword,
};
