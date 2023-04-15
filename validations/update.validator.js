const Joi = require("joi");

const updateSchema = Joi.object({
  full_name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string(),
  is_active: Joi.boolean(),
});

module.exports = updateSchema;
