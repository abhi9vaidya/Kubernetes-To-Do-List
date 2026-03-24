// ============================================================
// K8s To-Do List — Frontend Logic
// ============================================================
// This file handles all communication with the backend API.
//
// KEY CONCEPT: API_URL
//   In development, the frontend and backend run on different ports.
//   In Kubernetes, the frontend Nginx container reverse-proxies
//   /api/* requests to the backend Service (ClusterIP).
//
//   So API_URL = '/api' — requests go to the SAME origin (Nginx),
//   which forwards them internally inside the K8s cluster.
//   The frontend never needs to know the backend Pod's IP address.
//
//   This is the "Service" concept in action — services provide
//   stable DNS names so Pods can find each other.
// ============================================================

const API_URL = '/api';

// ---------- DOM Elements ----------
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const taskCount = document.getElementById('task-count');
const apiStatus = document.getElementById('api-status');

// ---------- Fetch All Tasks ----------
async function fetchTasks() {
  try {
    const res = await fetch(`${API_URL}/tasks`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const tasks = await res.json();
    renderTasks(tasks);
    updateStatus('connected');
  } catch (err) {
    console.error('Failed to fetch tasks:', err);
    updateStatus('error');
  }
}

// ---------- Add a Task ----------
async function addTask(title) {
  try {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await fetchTasks(); // Refresh the list
  } catch (err) {
    console.error('Failed to add task:', err);
    updateStatus('error');
  }
}

// ---------- Delete a Task ----------
async function deleteTask(id) {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await fetchTasks(); // Refresh the list
  } catch (err) {
    console.error('Failed to delete task:', err);
    updateStatus('error');
  }
}

// ---------- Render Tasks to DOM ----------
function renderTasks(tasks) {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
      <span class="task-title">${escapeHtml(task.title)}</span>
      <button class="delete-btn" title="Delete task" data-id="${task._id}">✕</button>
    `;
    taskList.appendChild(li);
  });

  // Update count
  const count = tasks.length;
  taskCount.textContent = `${count} task${count !== 1 ? 's' : ''}`;
}

// ---------- Update API Status Indicator ----------
function updateStatus(status) {
  apiStatus.className = 'api-status';

  if (status === 'connected') {
    apiStatus.textContent = 'API Connected';
    apiStatus.classList.add('connected');
  } else {
    apiStatus.textContent = 'API Unreachable';
    apiStatus.classList.add('error');
  }
}

// ---------- Escape HTML (prevent XSS) ----------
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ---------- Event Listeners ----------

// Form submit → add task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (title) {
    addTask(title);
    taskInput.value = '';
    taskInput.focus();
  }
});

// Delete button click (event delegation on the list)
taskList.addEventListener('click', (e) => {
  const btn = e.target.closest('.delete-btn');
  if (btn) {
    deleteTask(btn.dataset.id);
  }
});

// ---------- Initial Load ----------
fetchTasks();
