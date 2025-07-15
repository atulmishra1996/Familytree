import Joi from 'joi';

export const createPersonSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
  email: Joi.string().email().optional(),
  dateOfBirth: Joi.date().optional(),
  placeOfBirth: Joi.string().max(100).optional(),
  phoneNumber: Joi.string().pattern(/^[\+]?[\d]{1,16}$/).optional(),
  profilePhoto: Joi.string().uri().optional(),
  parentIds: Joi.array().items(Joi.string().uuid()).max(2).optional(),
  spouseId: Joi.string().uuid().optional(),
  notes: Joi.string().max(1000).optional()
});

export const updatePersonSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  email: Joi.string().email().optional(),
  dateOfBirth: Joi.date().optional(),
  placeOfBirth: Joi.string().max(100).optional(),
  phoneNumber: Joi.string().pattern(/^[\+]?[\d]{1,16}$/).optional(),
  profilePhoto: Joi.string().uri().optional(),
  notes: Joi.string().max(1000).optional()
});

export const personIdSchema = Joi.string().uuid().required();