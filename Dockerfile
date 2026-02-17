# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY frontend-app/frontend-app/package*.json ./frontend/
RUN cd frontend && npm ci --legacy-peer-deps

# Copy source
COPY frontend-app/frontend-app ./frontend

# Build Angular app
RUN cd frontend && npm run build -- --configuration production

# ---------- runtime stage ----------
FROM nginx:alpine

# Clean default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy nginx config
COPY frontend-app/frontend-app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular output
COPY --from=build /app/frontend/dist/frontend-app/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
