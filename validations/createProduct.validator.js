const Joi = require("joi");

const createProductSchema = Joi.object({
  title: Joi.string().trim().required(),
  price: Joi.string().required(),
  description: Joi.string(),
});

module.exports = createProductSchema;
