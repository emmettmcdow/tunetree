# **************************************************************** Frontend
FROM node:21-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:1.21-alpine AS frontend
COPY --from=frontend-build /frontend/build /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]


# **************************************************************** Backend
FROM golang:1.23-bookworm AS backend-build
WORKDIR /backend
COPY backend/* ./
RUN apt update \
 && DEBIAN_FRONTEND=noninteractive \
    apt-get install --no-install-recommends --ASsume-yes \
      build-essential \
      libsqlite3-dev
ENV CGO_ENABLED=1
RUN go build .

FROM scratch AS backend
COPY --from=backend-build /backend/backend /backend
COPY --from=backend-build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=backend-build /lib/x86_64-linux-gnu/libc.so.6 /lib/x86_64-linux-gnu/libc.so.6
COPY --from=backend-build /lib64/ld-linux-x86-64.so.2 /lib64/ld-linux-x86-64.so.2
EXPOSE 80
CMD ["/backend"]
