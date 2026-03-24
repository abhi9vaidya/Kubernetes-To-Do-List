# ============================================================
# Frontend Dockerfile
# ============================================================
# This packages the static frontend files into an Nginx container.
#
# WHY NGINX instead of a Node.js server?
#   → The frontend is just static files (HTML, JS, CSS).
#   → Nginx is purpose-built for serving static content — it's
#     faster, lighter (~25MB), and more secure than Node.js.
#   → Plus, Nginx handles our reverse proxy to the backend
#     (see nginx.conf — it proxies /api/* to backend-service).
#
# IN KUBERNETES:
#   → This image becomes its own Pod (frontend Deployment).
#   → The Pod serves the UI AND proxies API calls to the
#     backend Pod via the K8s Service network.
# ============================================================

# Use official Nginx Alpine image (tiny, ~25MB)
FROM nginx:alpine

# Remove the default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy our static frontend files
COPY index.html /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/

# Copy our custom Nginx config (with reverse proxy rules)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx listens on port 80 by default
EXPOSE 80

# Start Nginx in the foreground (required for containers)
CMD ["nginx", "-g", "daemon off;"]
