# 🧪 Kubernetes Commands Reference

A quick-reference guide for deploying, inspecting, and debugging the To-Do app on Kubernetes.

---

## 🚀 Step 1: Build Docker Images

Before Kubernetes can run our app, we need container images.

```bash
# Build the backend image
docker build -f docker/backend.Dockerfile -t todo-backend:latest ./backend

# Build the frontend image
docker build -f docker/frontend.Dockerfile -t todo-frontend:latest ./frontend
```

> **Why?** Kubernetes runs containers, not raw code. These commands package our
> Node.js API and Nginx frontend into portable container images.

---

## 📦 Step 2: Deploy to Kubernetes

Apply all manifests in the `k8s/` folder. Order matters — ConfigMap and Secrets
must exist before Deployments that reference them.

```bash
# Apply everything at once (K8s handles the dependency order)
kubectl apply -f k8s/

# Or apply in order (more explicit):
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mongo-pv.yaml
kubectl apply -f k8s/mongo-service.yaml
kubectl apply -f k8s/mongo-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

---

## ✅ Step 3: Verify Everything is Running

```bash
# Check all Pods — all should show STATUS: Running
kubectl get pods

# Check all Services — note the NodePort for frontend
kubectl get services

# Check Deployments — READY column should match DESIRED
kubectl get deployments

# Check PersistentVolumeClaims — should be Bound
kubectl get pvc
```

**Expected output (Pods):**
```
NAME                                    READY   STATUS    RESTARTS   AGE
mongo-deployment-xxxxx                  1/1     Running   0          1m
backend-deployment-xxxxx                1/1     Running   0          1m
backend-deployment-yyyyy                1/1     Running   0          1m
frontend-deployment-xxxxx               1/1     Running   0          1m
frontend-deployment-yyyyy               1/1     Running   0          1m
```

---

## 🌐 Step 4: Access the App

```bash
# If using Minikube:
minikube service frontend-service

# If using Docker Desktop Kubernetes:
# Open http://localhost:30080 in your browser

# If using Kind, forward the port:
kubectl port-forward service/frontend-service 8080:80
# Then open http://localhost:8080
```

---

## 🔍 Step 5: Debugging Commands

```bash
# View logs from a specific Pod
kubectl logs <pod-name>

# View logs from all backend Pods
kubectl logs -l app=todo-app,tier=backend

# Describe a Pod (events, conditions, container status)
kubectl describe pod <pod-name>

# Get a shell inside a running Pod
kubectl exec -it <pod-name> -- /bin/sh

# Check events for troubleshooting
kubectl get events --sort-by=.metadata.creationTimestamp

# Check ConfigMap values
kubectl get configmap todo-config -o yaml

# Check Secret values (base64 encoded)
kubectl get secret mongo-secret -o yaml
```

---

## 🔄 Step 6: Scaling

```bash
# Scale backend to 5 replicas
kubectl scale deployment backend-deployment --replicas=5

# Watch Pods spinning up in real-time
kubectl get pods -w

# Scale back down
kubectl scale deployment backend-deployment --replicas=2
```

---

## 🔄 Step 7: Rolling Updates

```bash
# Update backend image (after rebuilding with new code)
docker build -f docker/backend.Dockerfile -t todo-backend:v2 ./backend
kubectl set image deployment/backend-deployment todo-backend=todo-backend:v2

# Watch the rolling update in action
kubectl rollout status deployment/backend-deployment

# Undo a bad deployment (rollback)
kubectl rollout undo deployment/backend-deployment

# View rollout history
kubectl rollout history deployment/backend-deployment
```

---

## 🧹 Step 8: Cleanup

```bash
# Delete all resources
kubectl delete -f k8s/

# Verify everything is gone
kubectl get all
```

---

## 🔗 How Services Communicate Internally

```
Browser (http://localhost:30080)
    │
    ▼
frontend-service (NodePort 30080)
    │
    ▼
frontend-deployment Pods (Nginx)
    │
    ├── /              → serves index.html, app.js, styles.css
    └── /api/*         → proxy_pass to backend-service:5000
                            │
                            ▼
                backend-service (ClusterIP)
                            │
                            ▼
                backend-deployment Pods (Express)
                            │
                            ▼
                mongo-service (ClusterIP)
                            │
                            ▼
                mongo-deployment Pod (MongoDB)
                            │
                            ▼
                PersistentVolume (data on disk)
```

All internal communication uses **K8s DNS** — Services are resolved by name
automatically. No hardcoded IP addresses anywhere.
