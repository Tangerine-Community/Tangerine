echo ""
echo "You will need to install Docker manually. If there is an error in this script and you do have Docker installed, you may not be connected to a docker-machine, ie. eval \$(\"docker-machine env default)\".
echo ""

echo "Log this machine into your Docker Hub account
docker login && \
echo "Now pulling down the Tangerine Hub image"
docker pull tangerine/tangerine-server
