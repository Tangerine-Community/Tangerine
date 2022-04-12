# Configuring Nginx as SSL proxy server for Tangerine

## Update

Issue [#3147](https://github.com/Tangerine-Community/Tangerine/pull/3147) describes the start-ssl.sh script that automates installation of the SSL certificates 
as well as the letsencrypt-nginx-proxy-companion and nginx-proxy containers. The first time it runs it may error out - do a `docker logs -f letsencrypt-nginx-proxy-companion` to see error. If it does, restart the container (`docker restart letsencrypt-nginx-proxy-companion`). 

You may disregard the following notes - the new script supersedes them; however, they may have some useful information. 

## Initial configuration

First open config.sh and change the port mapping of Tangerine 
```
T_PORT_MAPPING="-p 8080:80"
```

Rebuild the container by running ./start.sh

## Pull nginx docker image and install certbot inside the nginx container

If your container is not called tangerine adjust below. --link is to allow the ngin container to forward to the tangerine one

```
docker pull nginx
docker run -p 80:80 -p 443:443 --link tangerine:tangerine --restart always --name nginx -d nginx
```

Go into the nginx container and execute the below commands

```
docker exec -it nginx bash

 apt-get update
 apt-get install certbot python-certbot-nginx
 apt-get install vim
```

Now execute and follow the promtps for cerbot. It will fail but that's ok
```
certbot --nginx
```
The above will generate the ertificate according to the DOMAIN.org name given. Modify the DOMAIN.ORG with your domain name in the file below and replace it with the content of the config

```
vi /etc/nginx/conf.d/default.conf 
```

```
server {
    listen       80;
    listen  [::]:80;
    server_name  _;
    client_max_body_size 0;
    #charset koi8-r;
    #access_log  /var/log/nginx/host.access.log  main;

	location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
            proxy_pass_header  Server;
            proxy_set_header   Host $http_host;
            proxy_redirect     off;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Scheme $scheme;
            proxy_set_header X-Forwarded-Host $host:$server_port;
            proxy_set_header X-Forwarded-Proto https;
            proxy_pass         http://tangerine;
        }


    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}

server {
server_name DOMAIN.ORG
client_max_body_size 0;

        location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
            proxy_pass_header  Server;
            proxy_set_header   Host $http_host;
            proxy_redirect     off;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Scheme $scheme;
            proxy_set_header X-Forwarded-Host $host:$server_port;
            proxy_set_header X-Forwarded-Proto https;
            proxy_pass         http://tangerine;
        }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/DOMAIN.ORG/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN.ORG/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = DOMAIN.ORG) {
        return 301 https://$host$request_uri;
    } # managed by Certbot
        listen 80 ;
        listen [::]:80 ;
    server_name DOMAIN.ORG;
    return 404; # managed by Certbot


}
```

Reload the config
```
service nginx reload
```

Exit the docker container and add the below entry to the root's crontab
Add this like to cron (crontab -e)
```
crontab -e
0 8 * * * docker exec -it nginx certbot renew --post-hook "service nginx reload"
```


Point your DNS to the actual server 
