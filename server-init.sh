sudo apt-get update

# install nginx
sudo apt-get install nginx=1.8.0 -y

if [ ! -a /etc/nginx/tangerine.conf ]; then
  sudo cp ./tangerine.conf /etc/nginx
  sudo echo 'include tangerine.conf;' >> /etc/nginx/nginx.conf
fi

# node
which_npm=`which npm`
if [ -z "$which_npm" ]; then
  sudo apt-get install nodejs npm -y
elif [ ! -z "$which_npm" ]; then
  echo "npm already installed"
fi

# node
which_pm2=`which pm2`
if [ -z "$which_pm2" ]; then
  sudo npm install -g pm2
elif [ ! -z "$which_npm" ]; then
  echo "pm2 already installed"
fi

if [ -a ./tree/server-init.sh ]; then
  ./tree/server-init.sh
fi

if [ -a ./cors-bulk-docs/server-init.sh ]; then
  ./cors-bulk-docs/server-init.sh
fi

if [ -a ./brockman/server-init.sh ]; then
  ./brockman/server-init.sh
fi

if [ -a ./editor/server-init.sh ]; then
  ./editor/server-init.sh
fi

pm2 start ecosystem.json