const taskService = require('../services/task.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const { getSocketIO } = require('../sockets');

// Helper: emit a real-time event to the project room
const emitToProject = (projectId, event, payload) => {
  try {
    const io = getSocketIO();
    io.to(`project:${projectId}`).emit(event, payload);
  } catch {
    // socket.io not initialized (e.g. during unit tests) — safe to ignore
  }
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

const createTask = catchAsync(async (req, res) => {
  const task = await taskService.createTask(req.params.projectId, req.body, req.user._id);
  emitToProject(req.params.projectId, 'task:created', task);
  ApiResponse.created(res, task);
});

const getTasks = catchAsync(async (req, res) => {
  const { tasks, pagination } = await taskService.getTasksForDashboard(
    req.params.projectId,
    req.query
  );
  ApiResponse.paginated(res, tasks, pagination);
});

const getTask = catchAsync(async (req, res) => {
  const task = await taskService.getTaskById(req.params.taskId, req.params.projectId);
  ApiResponse.success(res, task);
});

const updateTask = catchAsync(async (req, res) => {
  const task = await taskService.updateTask(req.params.taskId, req.params.projectId, req.body);
  emitToProject(req.params.projectId, 'task:updated', task);
  ApiResponse.success(res, task, 'Task updated');
});

const deleteTask = catchAsync(async (req, res) => {
  const task = await taskService.deleteTask(req.params.taskId, req.params.projectId);
  emitToProject(req.params.projectId, 'task:deleted', {
    taskId: task._id,
    projectId: req.params.projectId,
  });
  ApiResponse.noContent(res);
});

// ── Assignment ────────────────────────────────────────────────────────────────

const assignUsers = catchAsync(async (req, res) => {
  const task = await taskService.assignUsers(
    req.params.taskId,
    req.params.projectId,
    req.body.userIds
  );
  emitToProject(req.params.projectId, 'task:updated', task);
  ApiResponse.success(res, task, 'Users assigned');
});

const unassignUsers = catchAsync(async (req, res) => {
  const task = await taskService.unassignUsers(
    req.params.taskId,
    req.params.projectId,
    req.body.userIds
  );
  emitToProject(req.params.projectId, 'task:updated', task);
  ApiResponse.success(res, task, 'Users unassigned');
});

// ── Comments ──────────────────────────────────────────────────────────────────

const addComment = catchAsync(async (req, res) => {
  const task = await taskService.addComment(
    req.params.taskId,
    req.params.projectId,
    req.body.content,
    req.user._id
  );
  emitToProject(req.params.projectId, 'task:commented', task);
  ApiResponse.created(res, task, 'Comment added');
});

const deleteComment = catchAsync(async (req, res) => {
  const task = await taskService.deleteComment(
    req.params.taskId,
    req.params.projectId,
    req.params.commentId,
    req.user._id
  );
  emitToProject(req.params.projectId, 'task:updated', task);
  ApiResponse.success(res, task, 'Comment deleted');
});

// ── Search ────────────────────────────────────────────────────────────────────

const searchTasks = catchAsync(async (req, res) => {
  const tasks = await taskService.searchTasks(
    req.params.projectId,
    req.query.search,
    parseInt(req.query.limit, 10) || 20
  );
  ApiResponse.success(res, tasks);
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  assignUsers,
  unassignUsers,
  addComment,
  deleteComment,
  searchTasks,
};
