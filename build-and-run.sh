docker kill tangerine-v3
docker rm tangerine-v3
docker build -t tangerine/tangerine:v3 .
docker run -d -p 80:80 --name tangerine-v3 tangerine/tangerine:v3
