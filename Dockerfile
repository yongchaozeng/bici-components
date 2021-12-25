FROM nginx:1.15-alpine
COPY docs-dist /etc/nginx/html 
WORKDIR /etc/nginx/html