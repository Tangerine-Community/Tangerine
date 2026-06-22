TIMEOUT="20m"

trivy image --scanners vuln tangerine/server:latest --timeout $TIMEOUT --format template --template "@contrib/html.tpl" -o ../data/trivy-reports/tangerine-server.html
trivy image --scanners vuln tangerine/server-ui:latest --timeout $TIMEOUT --format template --template "@contrib/html.tpl" -o ../data/trivy-reports/tangerine-server-ui.html
trivy image --scanners vuln tangerine-couchdb:latest --timeout $TIMEOUT --format template --template "@contrib/html.tpl" -o ../data/trivy-reports/tangerine-couchdb.html
trivy image --scanners vuln tangerine/apk-generator:latest --timeout $TIMEOUT --format template --template "@contrib/html.tpl" -o ../data/trivy-reports/tangerine-apk-generator.html
trivy image --scanners vuln nginx:1.27-alpine --timeout $TIMEOUT --format template --template "@contrib/html.tpl" -o ../data/trivy-reports/nginx.html
