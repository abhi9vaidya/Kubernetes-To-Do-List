const mongoose = require('mongoose');

// ============================================================
// Task Schema
// ============================================================
// This is the data model for a To-Do item.
// Mongoose gives us schema validation + a clean API to talk to MongoDB.
//
// Why a separate model file?
//   → Separation of concerns. In real microservices, models are reusable
//     and testable independently from the API routes.
// ============================================================

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Task', taskSchema);
