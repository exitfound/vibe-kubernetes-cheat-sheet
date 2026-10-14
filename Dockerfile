FROM nginx:1.31.0-alpine

WORKDIR /usr/share/nginx/html

COPY configs/nginx.conf /etc/nginx/conf.d/default.conf

COPY . .

RUN rm -rf configs
RUN test -f sitemap.xml -a -f diagrams/card/index.html -a -f cli/section/index.html \
    || { echo 'static pages missing: run node tools/pages/build.mjs before docker build' >&2; exit 1; }

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["wget", "-q", "--spider", "http://127.0.0.1/"]
