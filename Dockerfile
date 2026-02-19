# ---------- BUILD STAGE ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY frontend-app/frontend-app/package*.json ./
RUN npm ci --legacy-peer-deps

COPY frontend-app/frontend-app ./

# Angular build (env handled by Angular itself)
RUN npm run build


# ---------- RUNTIME STAGE ----------
FROM nginx:1.25-alpine

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy nginx config
COPY frontend-app/frontend-app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy Angular build output
COPY --from=build /app/dist/frontend-app /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
