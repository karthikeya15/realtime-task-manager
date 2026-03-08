const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [150, 'Project name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
    color: {
      type: String,
      default: '#6366f1',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_, ret) => { delete ret.__v; return ret; } },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
// Fast membership checks: "find all projects where this user is a member"
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ createdAt: -1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────
projectSchema.virtual('memberCount').get(function () {
  return this.members.length;
});

// ── Instance Methods ───────────────────────────────────────────────────────────
projectSchema.methods.isMember = function (userId) {
  return this.members.some((m) => m.user.toString() === userId.toString());
};

projectSchema.methods.getMemberRole = function (userId) {
  const member = this.members.find((m) => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

projectSchema.methods.canEdit = function (userId) {
  if (this.owner.toString() === userId.toString()) return true;
  const role = this.getMemberRole(userId);
  return ['admin', 'owner'].includes(role);
};

module.exports = mongoose.model('Project', projectSchema);
