const express = require("express");
const {
  login,
  register,
  logOut,
  forgetPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logOut);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", verifyToken, changePassword);

module.exports = router;
