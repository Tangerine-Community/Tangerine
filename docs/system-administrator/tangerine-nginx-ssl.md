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

apt-get update && apt-get install certbot vim python3-certbot-nginx -y

```

Open the config file

```
vi /etc/nginx/conf.d/default.conf

```
Adjust the server_name to your domain and the size of the client body

```
server_name My.Domain.com;
client_max_body_size 0; 

```

Replace the location directive with the one below:
```
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

```
Save the file and exit vi

Now execute and follow the promtps for cerbot. It will fail but that's ok
```
certbot --nginx
```
The above will generate the certificate according to My.Domain.com name given. Select options 1. My.Domain.com

Reload the config by running
```
nginx -s reload
```


Exit the nginx container and add some configuration for autmatic updates of certificates
Execute crontab –e and add the line below
        
```
 0 3 * * * docker exec -it nginx certbot renew --post-hook "service nginx reload"
```

Optionally save your image to your docker images
```
docker commit nginx nginx/nginx:configuredNginx

```

### Note that your nginx container is now linked to your tangerine container. Every time you execute start.sh for tangerine you have to start a new nginx continer to udpate the link. TO recreate using the saved image run 'docker run -p 80:80 -p 443:443 --link tangerine:tangerine --restart always --name nginx -d nginx/nginx:configuredNginx'


Point your DNS to the actual server 
