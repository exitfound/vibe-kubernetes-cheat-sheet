FROM nginx:1.27-alpine

WORKDIR /usr/share/nginx/html

COPY configs/nginx.conf /etc/nginx/conf.d/default.conf

# Blanket on purpose: it is what makes this container the cheapest detector of a file the two
# workflow allowlists would have shipped by accident. Anything internal is kept out by
# .dockerignore instead, and a 404 here is the proof.
COPY . .

# configs/ is the one thing .dockerignore cannot keep out: the line above needs nginx.conf IN
# the build context, and an ignore rule applies to the whole context whatever the COPY order.
# So it is removed from the web root after the fact, or the container serves its own nginx
# config at /configs/nginx.conf. Nothing on kube.how is affected (deploy.yml stages by name),
# only whoever runs this image. unit/files.test.mjs asserts this line still exists.
RUN rm -rf configs

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
