# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY frontend-app/package*.json ./frontend-app/
RUN cd frontend-app && npm ci --legacy-peer-deps

COPY frontend-app ./frontend-app

# Build Angular app with production configuration
RUN cd frontend-app && npm run build -- --configuration production

# ---------- runtime stage ----------
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

# nginx config
COPY frontend-app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app (Angular 17+ outputs to dist/frontend-app/browser)
COPY --from=build /app/frontend-app/dist/frontend-app/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
