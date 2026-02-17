# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY frontend-app/frontend-app/package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY frontend-app/frontend-app ./

# Build Angular app
RUN npm run build --configuration production

# ---------- runtime stage ----------
FROM nginx:alpine

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy nginx config (FROM ROOT)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Angular build output
COPY --from=build /app/dist/frontend-app /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
