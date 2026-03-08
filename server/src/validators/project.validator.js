const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required(),
  description: Joi.string().trim().max(1000).allow('').default(''),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#6366f1'),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150),
  description: Joi.string().trim().max(1000).allow(''),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
  isArchived: Joi.boolean(),
}).min(1);

const addMemberSchema = Joi.object({
  userId: objectId.required(),
  role: Joi.string().valid('admin', 'member', 'viewer').default('member'),
});

module.exports = { createProjectSchema, updateProjectSchema, addMemberSchema };
