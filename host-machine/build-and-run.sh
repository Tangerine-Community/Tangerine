set -v
docker build -t tangerine/tangerine-server:test ../
./create-tangerine-server-container.sh test
docker logs -f tangerine-server-container
