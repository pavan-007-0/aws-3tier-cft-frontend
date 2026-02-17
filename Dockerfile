# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY frontend-app/frontend-app/package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY frontend-app/frontend-app ./

# Build Angular app
RUN npm run build -- --configuration production

# ---------- runtime stage ----------
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

# nginx config
COPY frontend-app/frontend-app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy Angular build output
COPY --from=build /app/dist/frontend-app /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
