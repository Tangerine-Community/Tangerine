set -v
docker build -t tangerine/tangerine-server:local ../
docker kill tangerine-server-container
docker rm tangerine-server-container
./create-tangerine-server-container.sh local 
docker logs -f tangerine-server-container
