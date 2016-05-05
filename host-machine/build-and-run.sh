set -v
docker build -t tangerine/tangerine-server:local ../
docker kill tangerine-server-container
docker rm tangerine-server-container
./run-container.sh local 
docker logs -f tangerine-server-container
