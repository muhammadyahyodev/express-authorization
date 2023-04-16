const Joi = require("joi");

const updateProductSchema = Joi.object({
  title: Joi.string().trim(),
  price: Joi.string(),
  description: Joi.string(),
});

module.exports = updateProductSchema;
