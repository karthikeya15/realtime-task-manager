const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

/**
 * Loads the project from :projectId and verifies the authenticated user
 * is either the owner or a member. Attaches req.project for downstream use.
 */
const requireProjectMember = catchAsync(async (req, res, next) => {
  const projectId = req.params.projectId;
  const project = await Project.findById(projectId);

  if (!project) {
    return next(ApiError.notFound('Project not found'));
  }

  if (project.isArchived) {
    return next(ApiError.badRequest('This project is archived'));
  }

  const userId = req.user._id.toString();
  const isOwner = project.owner.toString() === userId;
  const isMember = project.isMember(userId);

  if (!isOwner && !isMember) {
    return next(ApiError.forbidden('You are not a member of this project'));
  }

  req.project = project;
  next();
});

module.exports = requireProjectMember;
