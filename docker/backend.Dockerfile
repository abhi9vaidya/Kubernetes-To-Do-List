# ============================================================
# Backend Dockerfile
# ============================================================
# This packages the Node.js API into a container image.
#
# WHY CONTAINERS? (Kubernetes concept)
#   → Kubernetes doesn't run raw code — it runs CONTAINERS.
#   → A container = your app + its runtime + dependencies,
#     all bundled into a single, portable image.
#   → This image runs identically on your laptop, in CI/CD,
#     and on any Kubernetes node — no "works on my machine" issues.
#
# HOW CONTAINERS RELATE TO PODS:
#   → A Pod is the smallest unit in Kubernetes.
#   → A Pod wraps one or more containers.
#   → Usually it's 1 container per Pod (like this backend).
#   → The Pod adds networking (each Pod gets its own IP) and
#     lifecycle management (K8s restarts it if it crashes).
# ============================================================

# Use official Node.js LTS image (Alpine = tiny, ~50MB)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (Docker layer caching optimization)
# If package.json didn't change, Docker reuses the cached npm install layer
COPY package*.json ./

# Install production dependencies only (no devDependencies)
RUN npm ci --only=production

# Copy the rest of the application source
COPY . .

# Document the port (doesn't actually publish it — that's done in K8s Service)
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
