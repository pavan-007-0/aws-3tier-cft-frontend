# ---------- build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY frontend-app/frontend-app/package*.json ./
RUN npm ci --legacy-peer-deps

COPY frontend-app/frontend-app ./

# Angular static build
RUN npm run build

# ---------- runtime stage ----------
FROM nginx:1.25-alpine

# Clean default html
RUN rm -rf /usr/share/nginx/html/*

# Copy nginx config
COPY frontend-app/frontend-app/nginx.conf /etc/nginx/conf.d/default.conf

# ⚠️ IMPORTANT: copy BROWSER output
COPY --from=build /app/dist/frontend-app/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
