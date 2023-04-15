const Joi = require("joi");

const emailValidation = (email) => {
  const response = Joi.string().email().validate(email);

  if (response.error) {
    console.log(response.error);
    return false;
  }

  return true;
};

module.exports = emailValidation;
