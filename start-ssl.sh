
docker kill nginx-proxy
docker kill letsencrypt-nginx-proxy-companion
docker rm nginx-proxy
docker rm letsencrypt-nginx-proxy-companion

docker run -d -p 80:80 -p 443:443 \
    --name nginx-proxy \
    -v $(pwd)/certs:/etc/nginx/certs:ro \
    -v /etc/nginx/vhost.d \
    -v /usr/share/nginx/html \
    -v /var/run/docker.sock:/tmp/docker.sock:ro \
    --label com.github.jrcs.letsencrypt_nginx_proxy_companion.nginx_proxy \
    jwilder/nginx-proxy

docker run -d \
    --name letsencrypt-nginx-proxy-companion \
    -v $(pwd)/certs:/etc/nginx/certs:rw \
    -v /var/run/docker.sock:/var/run/docker.sock:ro \
    --volumes-from nginx-proxy \
    jrcs/letsencrypt-nginx-proxy-companion

export SSL_RUNNING="true"

./start.sh $1
