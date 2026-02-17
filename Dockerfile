# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (better caching)
COPY frontend-app/package*.json ./frontend-app/
RUN cd frontend-app && npm ci --legacy-peer-deps

# Copy source
COPY frontend-app ./frontend-app

# Build Angular app (production)
RUN cd frontend-app && npm run build -- --configuration production


# ---------- Runtime stage ----------
FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy nginx config
COPY frontend-app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular output
COPY --from=build /app/frontend-app/dist/frontend-app/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
