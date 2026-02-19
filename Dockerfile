# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY frontend-app/frontend-app/package*.json ./
RUN npm ci --legacy-peer-deps

COPY frontend-app/frontend-app ./
RUN npm run build

# Verify build output
RUN ls -la dist/frontend-app/browser/ || echo "Build output check failed"

# ---------- runtime stage ----------
FROM nginx:1.25-alpine

RUN rm -rf /usr/share/nginx/html/* && chmod 755 /usr/share/nginx/html

COPY frontend-app/frontend-app/nginx.conf /etc/nginx/conf.d/default.conf

# ✅ Copy built Angular app to Nginx
COPY --from=build /app/dist/frontend-app/browser /usr/share/nginx/html/

# ✅ Ensure assets (including images) are properly served with correct permissions
RUN chmod -R 755 /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html/assets 2>/dev/null || true

# Verify assets are present
RUN ls -la /usr/share/nginx/html/assets/ 2>/dev/null || echo "Assets folder check"

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
