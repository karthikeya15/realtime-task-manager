const router = require('express').Router();
const projectController = require('../controllers/project.controller');
const taskRoutes = require('./task.routes');
const { authenticate, authorize } = require('../middleware/auth');
const requireProjectMember = require('../middleware/requireProjectMember');
const validate = require('../middleware/validate');
const {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} = require('../validators/project.validator');

// All project routes require authentication
router.use(authenticate);

router.route('/')
  .get(projectController.getProjects)
  .post(validate(createProjectSchema), projectController.createProject);

router.route('/:projectId')
  .get(requireProjectMember, projectController.getProject)
  .patch(requireProjectMember, authorize('owner', 'admin'), validate(updateProjectSchema), projectController.updateProject)
  .delete(requireProjectMember, projectController.deleteProject);

router.post(
  '/:projectId/members',
  requireProjectMember,
  authorize('owner', 'admin'),
  validate(addMemberSchema),
  projectController.addMember
);

router.delete(
  '/:projectId/members/:userId',
  requireProjectMember,
  authorize('owner', 'admin'),
  projectController.removeMember
);

// Mount task routes under a project
router.use('/:projectId/tasks', requireProjectMember, taskRoutes);

module.exports = router;
