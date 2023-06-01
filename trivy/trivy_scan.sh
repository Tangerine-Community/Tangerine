TIMEOUT="20m"

trivy image --scanners vuln tangerine-server --timeout $TIMEOUT --format template --template "@contrib/html.tpl" -o ../data/trivy-reports/tangerine-server.html
trivy image --scanners vuln tangerine-server-ui --timeout $TIMEOUT --format template --template "@contrib/html.tpl" -o ../data/trivy-reports/tangerine-server-ui.html
trivy image --scanners vuln tangerine-couchdb --timeout $TIMEOUT --format template --template "@contrib/html.tpl" -o ../data/trivy-reports/tangerine-couchdb.html
trivy image --scanners vuln tangerine-apk-generator --timeout $TIMEOUT --format template --template "@contrib/html.tpl" -o ../data/trivy-reports/tangerine-apk-generator.html
