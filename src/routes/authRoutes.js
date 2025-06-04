const express = require("express");
const { login, register, logOut } = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logOut);

module.exports = router;
