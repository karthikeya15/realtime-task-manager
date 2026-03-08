const Project = require('../models/Project');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');

/**
 * Create a new project. The creator is automatically set as owner and first member.
 */
const createProject = async ({ name, description, color }, ownerId) => {
  const project = await Project.create({
    name,
    description,
    color,
    owner: ownerId,
    members: [{ user: ownerId, role: 'owner' }],
  });
  return project;
};

/**
 * List all projects where the user is owner or member.
 */
const getUserProjects = async (userId) => {
  return Project.find({
    $or: [{ owner: userId }, { 'members.user': userId }],
    isArchived: false,
  })
    .populate('owner', 'name email avatar')
    .sort({ updatedAt: -1 });
};

/**
 * Get a single project with populated members.
 */
const getProjectById = async (projectId) => {
  return Project.findById(projectId)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar lastSeen');
};

/**
 * Update project fields. Only owner/admin may call this.
 */
const updateProject = async (project, updates) => {
  Object.assign(project, updates);
  return project.save();
};

/**
 * Add a member to a project. Idempotent — no-op if already a member.
 */
const addMember = async (project, userId, role = 'member') => {
  if (project.isMember(userId)) {
    throw ApiError.conflict('User is already a member of this project');
  }
  project.members.push({ user: userId, role });
  return project.save();
};

/**
 * Remove a member from a project. Cannot remove the owner.
 */
const removeMember = async (project, userId) => {
  if (project.owner.toString() === userId.toString()) {
    throw ApiError.badRequest('Cannot remove the project owner');
  }
  project.members = project.members.filter(
    (m) => m.user.toString() !== userId.toString()
  );
  return project.save();
};

/**
 * Delete a project and cascade-delete all its tasks.
 */
const deleteProject = async (projectId) => {
  await Task.deleteMany({ project: projectId });
  await Project.findByIdAndDelete(projectId);
};

module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  addMember,
  removeMember,
  deleteProject,
};
