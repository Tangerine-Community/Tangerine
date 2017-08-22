docker build -t brocknode .
docker kill brocknode
docker rm brocknode
docker run -it --name brocknode -p 9229:9229 -p 81:81 brocknode
