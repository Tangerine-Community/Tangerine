docker build -t tangerine/tangerine:local-v3 .
./start.sh
docker logs -f tangerine-container
