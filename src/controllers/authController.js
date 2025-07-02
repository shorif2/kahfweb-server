const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateTokens } = require("../utils/authHandler");

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

module.exports = {
  login,
  register,
  logOut,
};
