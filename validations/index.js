const signup = require("./signup.validator");
const login = require("./signin.validator");
const update = require("./update.validator");
const createProduct = require("./createProduct.validator");
const updateProduct = require("./updateProduct.validator");

module.exports = {
  signup,
  login,
  update,
  createProduct,
  updateProduct,
};
