const Joi = require("joi");

const userSchema = Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  is_active: Joi.boolean().default(false),
});

module.exports = userSchema;
