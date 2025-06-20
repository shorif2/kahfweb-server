const express = require("express");
require("dotenv").config();
const cors = require("cors");
const dbConnect = require("./config/dbConnect.js");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cookieParser = require("cookie-parser");
dbConnect();
const app = express();
const port = process.env.PORT || 3000;

//Middleware
app.use(express.json());
// app.use(cors({ origin: "http://localhost:8080", credentials: true }));
app.use(
  cors({ origin: "https://kahfweb-server.vercel.app", credentials: true })
);
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/order", orderRoutes);

//Home route
app.get("/", (req, res) => {
  res.send("Hello, Express!66sdfsdsdsd7777");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
