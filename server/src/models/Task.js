const mongoose = require('mongoose');

// ── Comment sub-document ──────────────────────────────────────────────────────
// Design decision: EMBEDDED comments (not referenced).
// Rationale: Comments are always fetched with their parent task — embedding
// avoids a second round-trip and keeps the document boundary clean. We accept
// the tradeoff that very long comment threads grow the document size; for this
// use case that's acceptable (max ~200 comments / task is reasonable).
const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Task document ─────────────────────────────────────────────────────────────
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in_progress', 'in_review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
    position: {
      type: Number,
      default: 0,
    },
    comments: [commentSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => { delete ret.__v; return ret; },
    },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
// Primary query pattern: all tasks for a project, sorted newest-first
taskSchema.index({ project: 1, createdAt: -1 });

// Dashboard filter: tasks by status within a project
taskSchema.index({ project: 1, status: 1 });

// Assignee filter
taskSchema.index({ project: 1, assignees: 1 });

// Cursor-based pagination anchor
taskSchema.index({ project: 1, _id: -1 });

// Full-text search across title, description, and comment content
taskSchema.index(
  { title: 'text', description: 'text', 'comments.content': 'text' },
  { name: 'task_text_search', weights: { title: 10, description: 5, 'comments.content': 1 } }
);

module.exports = mongoose.model('Task', taskSchema);
