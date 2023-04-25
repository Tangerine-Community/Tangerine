TIMEOUT="20m"

trivy image --scanners vuln tangerine-v4-server --timeout $TIMEOUT --format template --template "@trivy/contrib/html.tpl" -o trivy/reports/tangerine-v4-server.html
trivy image --scanners vuln tangerine-v4-server-ui --timeout $TIMEOUT --format template --template "@trivy/contrib/html.tpl" -o trivy/reports/tangerine-v4-server-ui.html
trivy image --scanners vuln tangerine-v4-couchdb --timeout $TIMEOUT --format template --template "@trivy/contrib/html.tpl" -o trivy/reports/tangerine-v4-couchdb.html
trivy image --scanners vuln tangerine-v4-apk-generator --timeout $TIMEOUT --format template --template "@trivy/contrib/html.tpl" -o trivy/reports/tangerine-v4-apk-generator.html
