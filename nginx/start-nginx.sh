
echo "Stopping nginx-base"
docker stop nginx-base > /dev/null
echo "Removing nginx-base"
docker rm nginx-base > /dev/null
docker build -t nginx-reverse-proxy .
docker run -d --name nginx-base -p 80:80 nginx-reverse-proxy:latest
docker logs -f nginx-base