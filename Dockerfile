FROM nginx:1.27-alpine

WORKDIR /usr/share/nginx/html

COPY configs/nginx.conf /etc/nginx/conf.d/default.conf
COPY . .

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
