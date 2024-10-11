FROM node:21-alpine as frontend-build
WORKDIR /frontend
COPY package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:1.21-alpine
COPY --from=frontend-build /frontend/build /usr/share/nginx/html
# Copy custom Nginx configuration (if needed)
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
