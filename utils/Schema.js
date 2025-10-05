const Joi = require('joi');

const campgroundSchema = Joi.object({
  title: Joi.string().required(),
  image: Joi.string().uri().required(),
  location: Joi.string().required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().required()
});

const reviewSchema = Joi.object({
  body: Joi.string().required(),
  rating: Joi.number().min(1).max(10).required()
});

module.exports = {
  campgroundSchema,
  reviewSchema
};
