const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const tokenFromReq = req.cookies.accessToken;

  if (!tokenFromReq) {
    const renewed = await renewToken(req, res);
    if (renewed) {
      return next();
    } else {
      return res
        .status(401)
        .json({ message: "Access token expired and refresh token invalid." });
    }
  }

  try {
    console.log("hit");
    const decoded = jwt.verify(tokenFromReq, process.env.JWT_SECRET);
    req.user = decoded;
    // console.log("The decoded user is:", req.user);
    next();
  } catch (error) {
    // If token is invalid, try to renew
    const renewed = await renewToken(req, res);
    if (renewed) {
      return next();
    } else {
      return res
        .status(400)
        .json({ message: "Token is not valid and refresh failed." });
    }
  }
};
const verifyTokenOld = (req, res, next) => {
  let token;
  let authheader = req.headers.Authorization || req.headers.authorization;

  if (authheader && authheader.startsWith("Bearer")) {
    token = authheader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, Authorization denied" });
    }
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
      console.log("The decoded user is : ", req.user);
      next();
    } catch (error) {
      res.status(400).json({ message: "token is not valid" });
    }
  } else {
    res.status(401).json({ message: "No token, Authorization denied" });
  }
};

const renewToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  return new Promise((resolve, reject) => {
    if (!refreshToken) {
      return resolve(false);
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return resolve(false);
      }

      const newAccessToken = jwt.sign(
        { email: decoded.email },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 60000,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      req.user = decoded; // Set user from refresh token
      resolve(true);
    });
  });
};

module.exports = verifyToken;
