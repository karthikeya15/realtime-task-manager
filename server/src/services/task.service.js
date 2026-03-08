const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');

// ── Helpers ───────────────────────────────────────────────────────────────────
const POPULATE_OPTS = [
  { path: 'assignees', select: 'name email avatar' },
  { path: 'createdBy', select: 'name email avatar' },
  { path: 'comments.author', select: 'name email avatar' },
];

/**
 * Build a standard populated query.
 */
const populatedTask = (query) => query.populate(POPULATE_OPTS);

// ── CRUD ──────────────────────────────────────────────────────────────────────

const createTask = async (projectId, data, userId) => {
  const task = await Task.create({ ...data, project: projectId, createdBy: userId });
  return populatedTask(Task.findById(task._id));
};

const getTaskById = async (taskId, projectId) => {
  const task = await populatedTask(Task.findOne({ _id: taskId, project: projectId }));
  if (!task) throw ApiError.notFound('Task not found');
  return task;
};

const updateTask = async (taskId, projectId, updates) => {
  const task = await populatedTask(
    Task.findOneAndUpdate(
      { _id: taskId, project: projectId },
      { $set: updates },
      { new: true, runValidators: true }
    )
  );
  if (!task) throw ApiError.notFound('Task not found');
  return task;
};

const deleteTask = async (taskId, projectId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, project: projectId });
  if (!task) throw ApiError.notFound('Task not found');
  return task;
};

// ── Assignment ────────────────────────────────────────────────────────────────

const assignUsers = async (taskId, projectId, userIds) => {
  const task = await populatedTask(
    Task.findOneAndUpdate(
      { _id: taskId, project: projectId },
      { $addToSet: { assignees: { $each: userIds } } },
      { new: true }
    )
  );
  if (!task) throw ApiError.notFound('Task not found');
  return task;
};

const unassignUsers = async (taskId, projectId, userIds) => {
  const task = await populatedTask(
    Task.findOneAndUpdate(
      { _id: taskId, project: projectId },
      { $pullAll: { assignees: userIds } },
      { new: true }
    )
  );
  if (!task) throw ApiError.notFound('Task not found');
  return task;
};

// ── Comments ──────────────────────────────────────────────────────────────────

const addComment = async (taskId, projectId, content, authorId) => {
  const task = await Task.findOne({ _id: taskId, project: projectId });
  if (!task) throw ApiError.notFound('Task not found');

  task.comments.push({ author: authorId, content });
  await task.save();

  return populatedTask(Task.findById(task._id));
};

const deleteComment = async (taskId, projectId, commentId, userId) => {
  const task = await Task.findOne({ _id: taskId, project: projectId });
  if (!task) throw ApiError.notFound('Task not found');

  const comment = task.comments.id(commentId);
  if (!comment) throw ApiError.notFound('Comment not found');
  if (comment.author.toString() !== userId.toString()) {
    throw ApiError.forbidden('Cannot delete another user\'s comment');
  }

  comment.deleteOne();
  await task.save();
  return populatedTask(Task.findById(task._id));
};

// ── Dashboard / Pagination ────────────────────────────────────────────────────

/**
 * Cursor-based pagination for task lists.
 *
 * Design decision: Cursor > Offset pagination.
 * Offset (SKIP/LIMIT) degrades with large collections because MongoDB must
 * scan all skipped documents. A cursor anchored on _id (an indexed field)
 * jumps directly to the next page regardless of dataset size — O(log n).
 * The tradeoff: you lose the ability to jump to an arbitrary page number,
 * which is acceptable for an infinite-scroll dashboard UI.
 *
 * Cursor is base64(ObjectId string) to make it opaque to clients.
 */
const getTasksForDashboard = async (projectId, query) => {
  const { status, assignee, priority, cursor, limit = 20 } = query;

  const filter = { project: projectId };
  if (status) filter.status = status;
  if (assignee) filter.assignees = assignee;
  if (priority) filter.priority = priority;

  if (cursor) {
    const decodedId = Buffer.from(cursor, 'base64').toString('utf8');
    filter._id = { $lt: decodedId };
  }

  const tasks = await populatedTask(
    Task.find(filter).sort({ _id: -1 }).limit(limit + 1)
  );

  const hasNextPage = tasks.length > limit;
  const results = hasNextPage ? tasks.slice(0, limit) : tasks;
  const nextCursor = hasNextPage
    ? Buffer.from(results[results.length - 1]._id.toString()).toString('base64')
    : null;

  return {
    tasks: results,
    pagination: { hasNextPage, nextCursor, limit },
  };
};

// ── Search ────────────────────────────────────────────────────────────────────

/**
 * Full-text search leveraging MongoDB's $text index on title, description,
 * and comment content. Returns tasks sorted by relevance score.
 */
const searchTasks = async (projectId, searchQuery, limit = 20) => {
  if (!searchQuery || searchQuery.trim().length === 0) {
    throw ApiError.badRequest('Search query cannot be empty');
  }

  const tasks = await populatedTask(
    Task.find(
      { project: projectId, $text: { $search: searchQuery } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
  );

  return tasks;
};

module.exports = {
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  assignUsers,
  unassignUsers,
  addComment,
  deleteComment,
  getTasksForDashboard,
  searchTasks,
};
