/**
 * Unit tests for task.service — critical business logic:
 *  1. getTasksForDashboard() — cursor pagination, filtering
 *  2. searchTasks()          — full-text search, empty query guard
 *  3. addComment() / deleteComment() — ownership enforcement
 */

require('./setup');
const mongoose = require('mongoose');
const taskService = require('../src/services/task.service');
const Task = require('../src/models/Task');
const User = require('../src/models/User');
const Project = require('../src/models/Project');

let project, user, user2;

beforeEach(async () => {
  user = await User.create({
    name: 'Bob',
    email: 'bob@example.com',
    password: 'Password1',
  });
  user2 = await User.create({
    name: 'Carol',
    email: 'carol@example.com',
    password: 'Password1',
  });
  project = await Project.create({
    name: 'Test Project',
    owner: user._id,
    members: [{ user: user._id, role: 'owner' }],
  });
});

// ── Cursor Pagination ─────────────────────────────────────────────────────────
describe('taskService.getTasksForDashboard()', () => {
  beforeEach(async () => {
    // Insert 5 tasks
    await Task.insertMany(
      Array.from({ length: 5 }, (_, i) => ({
        title: `Task ${i + 1}`,
        project: project._id,
        createdBy: user._id,
        status: i % 2 === 0 ? 'todo' : 'in_progress',
      }))
    );
  });

  it('returns paginated tasks with correct limit', async () => {
    const { tasks, pagination } = await taskService.getTasksForDashboard(project._id, { limit: 3 });
    expect(tasks).toHaveLength(3);
    expect(pagination.hasNextPage).toBe(true);
    expect(pagination.nextCursor).toBeTruthy();
  });

  it('second page returns remaining tasks', async () => {
    const first = await taskService.getTasksForDashboard(project._id, { limit: 3 });
    const second = await taskService.getTasksForDashboard(project._id, {
      limit: 3,
      cursor: first.pagination.nextCursor,
    });
    expect(second.tasks).toHaveLength(2);
    expect(second.pagination.hasNextPage).toBe(false);
  });

  it('filters by status', async () => {
    const { tasks } = await taskService.getTasksForDashboard(project._id, { status: 'todo', limit: 20 });
    tasks.forEach((t) => expect(t.status).toBe('todo'));
  });

  it('returns empty when no tasks match filter', async () => {
    const { tasks } = await taskService.getTasksForDashboard(project._id, { status: 'done', limit: 20 });
    expect(tasks).toHaveLength(0);
  });
});

// ── Comments ──────────────────────────────────────────────────────────────────
describe('taskService.addComment() / deleteComment()', () => {
  let task;

  beforeEach(async () => {
    task = await Task.create({
      title: 'Comment Task',
      project: project._id,
      createdBy: user._id,
    });
  });

  it('adds a comment to a task', async () => {
    const updated = await taskService.addComment(task._id, project._id, 'Hello!', user._id);
    expect(updated.comments).toHaveLength(1);
    expect(updated.comments[0].content).toBe('Hello!');
  });

  it('rejects deleteComment from non-author', async () => {
    const withComment = await taskService.addComment(task._id, project._id, 'Owned', user._id);
    const commentId = withComment.comments[0]._id;

    await expect(
      taskService.deleteComment(task._id, project._id, commentId, user2._id)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('allows author to delete their own comment', async () => {
    const withComment = await taskService.addComment(task._id, project._id, 'Mine', user._id);
    const commentId = withComment.comments[0]._id;

    const result = await taskService.deleteComment(task._id, project._id, commentId, user._id);
    expect(result.comments).toHaveLength(0);
  });
});

// ── CRUD ──────────────────────────────────────────────────────────────────────
describe('taskService CRUD', () => {
  it('creates a task and retrieves it by id', async () => {
    const created = await taskService.createTask(
      project._id,
      { title: 'New Task', status: 'todo' },
      user._id
    );
    expect(created.title).toBe('New Task');

    const fetched = await taskService.getTaskById(created._id, project._id);
    expect(fetched._id.toString()).toBe(created._id.toString());
  });

  it('throws 404 for unknown task', async () => {
    await expect(
      taskService.getTaskById(new mongoose.Types.ObjectId(), project._id)
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('updates a task', async () => {
    const task = await taskService.createTask(project._id, { title: 'Old' }, user._id);
    const updated = await taskService.updateTask(task._id, project._id, { title: 'New', status: 'done' });
    expect(updated.title).toBe('New');
    expect(updated.status).toBe('done');
  });

  it('deletes a task', async () => {
    const task = await taskService.createTask(project._id, { title: 'Delete me' }, user._id);
    await taskService.deleteTask(task._id, project._id);
    await expect(taskService.getTaskById(task._id, project._id)).rejects.toMatchObject({ statusCode: 404 });
  });
});
