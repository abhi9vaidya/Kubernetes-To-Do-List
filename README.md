# ☸️ Kubernetes To-Do List

A microservices To-Do application built with **Node.js**, **MongoDB**, and deployed on **Kubernetes** — designed as a step-by-step learning project for container orchestration.

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│   MongoDB    │
│  (Nginx)     │     │  (Express)   │     │  (Database)  │
│  Port: 80    │     │  Port: 5000  │     │  Port: 27017 │
└──────────────┘     └──────────────┘     └──────────────┘
   NodePort            ClusterIP            ClusterIP
  (external)          (internal)           (internal)
```

Each box above = a separate **Kubernetes Deployment** running in its own **Pod(s)**.

## 📁 Project Structure

```
Kubernetes-To-Do-List/
├── backend/          # Node.js Express API
├── frontend/         # Static HTML/JS/CSS served by Nginx
├── k8s/              # Kubernetes manifest files (YAML)
├── docker/           # Dockerfiles for each service
├── COMMANDS.md       # kubectl command reference
└── README.md
```

## 🛠️ Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- A local Kubernetes cluster:
  - [Minikube](https://minikube.sigs.k8s.io/docs/start/)
  - [Docker Desktop Kubernetes](https://docs.docker.com/desktop/kubernetes/)
  - [Kind](https://kind.sigs.k8s.io/)

## 🚀 Quick Start

```bash
# 1. Build Docker images
docker build -f docker/backend.Dockerfile -t todo-backend:latest ./backend
docker build -f docker/frontend.Dockerfile -t todo-frontend:latest ./frontend

# 2. Deploy to Kubernetes
kubectl apply -f k8s/

# 3. Access the app
# Open http://localhost:30080 in your browser
```

## 📚 Concepts Covered

| Phase | Topic | K8s Concept |
|-------|-------|-------------|
| 0 | Project Setup | Microservices architecture |
| 1 | Backend API | Stateless services |
| 2 | Frontend | Service-to-service communication |
| 3 | Docker | Containers → Pods |
| 4 | Deployments | Pod management & replicas |
| 5 | Services | Networking (ClusterIP, NodePort) |
| 6 | ConfigMap & Secrets | Configuration management |
| 7 | Persistent Volumes | Stateful storage |
| 8 | Testing | kubectl debugging |
| 9 | Scaling | Rolling updates & replicas |

## 📝 License

MIT
