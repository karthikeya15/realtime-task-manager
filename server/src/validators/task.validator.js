const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().max(5000).allow('').default(''),
  status: Joi.string().valid(...STATUSES).default('todo'),
  priority: Joi.string().valid(...PRIORITIES).default('medium'),
  assignees: Joi.array().items(objectId).default([]),
  dueDate: Joi.date().iso().greater('now').allow(null).default(null),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(20).default([]),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().max(5000).allow(''),
  status: Joi.string().valid(...STATUSES),
  priority: Joi.string().valid(...PRIORITIES),
  dueDate: Joi.date().iso().allow(null),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(20),
  position: Joi.number().integer().min(0),
}).min(1);

const assignSchema = Joi.object({
  userIds: Joi.array().items(objectId).min(1).required(),
});

const addCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(2000).required(),
});

const taskQuerySchema = Joi.object({
  status: Joi.string().valid(...STATUSES),
  assignee: objectId,
  priority: Joi.string().valid(...PRIORITIES),
  cursor: Joi.string(), // base64-encoded _id for cursor pagination
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(200),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  assignSchema,
  addCommentSchema,
  taskQuerySchema,
};
