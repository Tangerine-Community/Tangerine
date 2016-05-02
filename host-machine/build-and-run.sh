set -v
docker build -t tangerine/tangerine-server:latest ../
./create-tangerine-server-container.sh
docker logs -f tangerine-server-container
