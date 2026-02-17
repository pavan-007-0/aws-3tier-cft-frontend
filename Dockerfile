# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# install deps
COPY frontend-app/frontend-app/package*.json ./
RUN npm ci --legacy-peer-deps

# copy source
COPY frontend-app/frontend-app ./

# ✅ correct Angular prod build
RUN npm run build -- --configuration=production

# ---------- runtime stage ----------
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

# nginx config (must exist here)
COPY frontend-app/frontend-app/nginx.conf /etc/nginx/conf.d/default.conf

# Angular 21 output
COPY --from=build /app/dist/frontend-app /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
