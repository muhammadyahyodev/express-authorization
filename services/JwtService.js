/**
 * @class JwtService
 */

const jwt = require("jsonwebtoken");
const config = require("config");

/**
 * @name: JwtService
 */
class JwtService {
  /**
   * JwtService constructor
   * @param accessKey
   * @param accessTime
   */
  constructor(accessKey, accessTime) {
    this.tokenKey = accessKey;
    this.tokenTime = accessTime;
  }

  /**
   * Verify token
   * @param token
   * @param callback
   * @returns {*}
   */
  async verifyAccess(token) {
    console.log("TOKEN: ", token);
    return jwt.verify(token, this.tokenKey, {});
  }

  generateTokens(payload) {
    const token = jwt.sign(payload, this.tokenKey, {
      expiresIn: this.tokenTime,
    });

    return {
      token,
    };
  }
}

module.exports = new JwtService(
  config.get("access_key"),
  config.get("access_time")
);
