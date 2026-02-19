# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY frontend-app/frontend-app/package*.json ./
RUN npm ci --legacy-peer-deps

COPY frontend-app/frontend-app ./
RUN npm run build

# ---------- runtime stage ----------
FROM nginx:1.25-alpine

RUN rm -rf /usr/share/nginx/html/* && chmod 755 /usr/share/nginx/html

COPY frontend-app/frontend-app/nginx.conf /etc/nginx/conf.d/default.conf

# ✅ THIS LINE IS THE KEY - Copy built Angular app to Nginx
COPY --from=build /app/dist/frontend-app/browser /usr/share/nginx/html/
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
