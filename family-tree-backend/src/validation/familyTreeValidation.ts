import Joi from 'joi';

export const createFamilyTreeSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  rootPersonIds: Joi.array().items(Joi.string().uuid()).optional()
});

export const updateFamilyTreeSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  rootPersonIds: Joi.array().items(Joi.string().uuid()).optional()
});

export const familyTreeIdSchema = Joi.string().uuid().required();