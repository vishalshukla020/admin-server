const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send("Access denied");
  }

  try {
    jwt.verify(token, process.env.TOKEN_SECRET_KEY, async (err, user) => {
      if (user) {
        req.user = user;
        next();
      } else if (err.message === "TokenExpiredError") {
        return res.status(403).send({
          success: false,
          msg: "Access token expired",
        });
      } else {
        console.log(err);
        return res.status(403).send({ err, msg: "User not authenticated" });
      }
    });
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};
