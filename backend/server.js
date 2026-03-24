const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Task = require('./models/Task');

// ============================================================
// Server Configuration
// ============================================================
// PORT and MONGO_URI come from environment variables — NOT hardcoded.
//
// WHY? (Kubernetes concept: Externalized Configuration)
//   → In Kubernetes, we inject config via ConfigMaps and Secrets.
//   → The same container image works in dev, staging, and production
//     by simply changing the environment variables.
//   → This is one of the "12-Factor App" principles — a real-world
//     best practice used by every major cloud-native application.
// ============================================================

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tododb';

const app = express();

// ============================================================
// Middleware
// ============================================================
// CORS: Allows frontend (running on a different origin/port) to
//        call this API. In K8s, frontend and backend are separate
//        Pods — CORS bridges that gap during development.
// JSON parser: Express doesn't parse JSON bodies by default.
// ============================================================

app.use(cors());
app.use(express.json());

// ============================================================
// Health Check Endpoint
// ============================================================
// WHY? Kubernetes uses health checks (liveness & readiness probes)
// to know if your Pod is alive and ready to serve traffic.
// If this returns non-200, K8s will restart the Pod automatically.
// ============================================================

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// API Routes
// ============================================================
// These are stateless — no session, no in-memory cache.
//
// WHY STATELESS? (Kubernetes concept: Horizontal Scaling)
//   → If the backend stored state in memory (like sessions),
//     scaling to 3 replicas would break — each replica has its
//     own memory. Request A goes to Pod 1, request B goes to Pod 2,
//     and Pod 2 has no idea about Pod 1's state.
//   → By making every request self-contained (just talk to the DB),
//     ANY replica can handle ANY request. This is what makes
//     Kubernetes scaling work.
// ============================================================

// GET /tasks — Retrieve all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /tasks — Create a new task
app.post('/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    const task = await Task.create({ title: title.trim() });
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err.message);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// DELETE /tasks/:id — Delete a task by ID
app.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted', task });
  } catch (err) {
    console.error('Error deleting task:', err.message);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ============================================================
// Database Connection & Server Start
// ============================================================
// We connect to MongoDB FIRST, then start listening.
//
// WHY? (Kubernetes concept: Readiness)
//   → A Pod that starts listening before the DB is connected will
//     receive traffic it can't handle → 500 errors for users.
//   → In production, you'd add a readiness probe that checks DB
//     connectivity. For now, we simply await the connection.
//
// WHY EXTERNALIZE MONGO_URI?
//   → In Kubernetes, MongoDB runs in a separate Pod with its own
//     Service (e.g., "mongo-service"). The connection string becomes:
//     mongodb://mongo-service:27017/tododb
//   → This is injected via a ConfigMap — the code never changes,
//     only the config does.
// ============================================================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB at', MONGO_URI);
    app.listen(PORT, () => {
      console.log(`🚀 Backend API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
