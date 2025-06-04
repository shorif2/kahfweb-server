const jwt = require("jsonwebtoken");

const generateTokens = async (user) => {
  const accessToken = await jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_AT }
  );

  let refreshToken = await jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_AT }
  );
  return { accessToken, refreshToken };
};

//use later
const generateDecodedToken = async (token, secret) => {
  const { err, decoded } = await jwt.verify(
    token,
    secret,
    function (err, decoded) {
      console.log(decoded, "from decoded");
      return { err, decoded };
    }
  );
  return { err, decoded };
};

module.exports = { generateTokens, generateDecodedToken };
