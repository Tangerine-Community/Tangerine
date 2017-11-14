docker kill tangerine-client
docker rm tangerine-client
docker run -d --name tangerine-client -p 4200:4200 tangerine/tangerine-client:local 
docker logs -f tangerine-client
