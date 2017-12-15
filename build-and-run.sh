docker build -t tangerine/tangerine:dev .

source ./config.defaults.sh
if [ -f "./config.sh" ]; then
  source ./config.sh
else
  echo "You have no config.sh. Copy config.defaults.sh to config.sh, change the passwords and try again." && exit 1;
fi

./start.sh

docker logs -f $T_CONTAINER_NAME &
docker logs -f cordova-apk-server
