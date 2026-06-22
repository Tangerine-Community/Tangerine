FROM nginx:1.27-alpine
# Upgrade OS packages to patch CVEs
RUN apk upgrade --no-cache
COPY default.conf /etc/nginx/conf.d/default.conf