const projectService = require('../services/project.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const createProject = catchAsync(async (req, res) => {
  const project = await projectService.createProject(req.body, req.user._id);
  ApiResponse.created(res, project);
});

const getProjects = catchAsync(async (req, res) => {
  const projects = await projectService.getUserProjects(req.user._id);
  ApiResponse.success(res, projects);
});

const getProject = catchAsync(async (req, res) => {
  const project = await projectService.getProjectById(req.params.projectId);
  ApiResponse.success(res, project);
});

const updateProject = catchAsync(async (req, res) => {
  // Only owner/admin can update — enforced via authorize() in router
  const updated = await projectService.updateProject(req.project, req.body);
  ApiResponse.success(res, updated, 'Project updated');
});

const deleteProject = catchAsync(async (req, res) => {
  if (req.project.owner.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the project owner can delete this project');
  }
  await projectService.deleteProject(req.params.projectId);
  ApiResponse.noContent(res);
});

const addMember = catchAsync(async (req, res) => {
  const { userId, role } = req.body;
  const updated = await projectService.addMember(req.project, userId, role);
  ApiResponse.success(res, updated, 'Member added');
});

const removeMember = catchAsync(async (req, res) => {
  const updated = await projectService.removeMember(req.project, req.params.userId);
  ApiResponse.success(res, updated, 'Member removed');
});

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
