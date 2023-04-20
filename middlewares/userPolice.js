const config = require("config");
const jwt = require("../services/JwtService");
const to = require("../helpers/functionHandler");

module.exports = async function (req, res, next) {
  if (req.method === "OPTIONS") {
    next();
  }

  try {
    const { authorization } = req.headers;
    const { id } = req.params;

    if (!authorization) {
      return res.status(403).json({ message: "User is not registered" });
    }

    const bearer = authorization.split(" ")[0];
    const token = authorization.split(" ")[1];

    if (!token && bearer === "Bearer") {
      return res.status(403).json({ message: "User is not registered" });
    }

    [error, decodedData] = await to(
      jwt.verifyAccess(token, config.get("secret"), {})
    );

    if (error) {
      return res.status(400).json({ friendlyMsg: err.message });
    }

    req.user = decodedData;

    if (decodedData.id !== id) {
      return res
        .status(403)
        .json({ message: "Error: the JWT is not owned by the admin" });
    }

    next();
  } catch (error) {
    return res.status(403).json({ message: "User is unauthorized" });
  }
};
