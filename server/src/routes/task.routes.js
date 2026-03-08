const router = require('express').Router({ mergeParams: true }); // mergeParams exposes :projectId
const taskController = require('../controllers/task.controller');
const validate = require('../middleware/validate');
const {
  createTaskSchema,
  updateTaskSchema,
  assignSchema,
  addCommentSchema,
  taskQuerySchema,
} = require('../validators/task.validator');
const Joi = require('joi');

// Dashboard / paginated list + search
router.get(
  '/',
  validate(taskQuerySchema, 'query'),
  taskController.getTasks
);

router.get(
  '/search',
  validate(Joi.object({ search: Joi.string().required(), limit: Joi.number().integer().max(100) }), 'query'),
  taskController.searchTasks
);

// Task CRUD
router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/:taskId', taskController.getTask);
router.patch('/:taskId', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:taskId', taskController.deleteTask);

// Assignment
router.post('/:taskId/assign', validate(assignSchema), taskController.assignUsers);
router.post('/:taskId/unassign', validate(assignSchema), taskController.unassignUsers);

// Comments
router.post('/:taskId/comments', validate(addCommentSchema), taskController.addComment);
router.delete('/:taskId/comments/:commentId', taskController.deleteComment);

module.exports = router;
