git submodule init
git submodule update

sudo apt-get update
updated_recently=TRUE

# install nginx
which_nginx=`which nginx`
if [ ! -z "$which_nginx" ]; then
  echo "nginx already installed"
else
  sudo apt-get install nginx -y
fi

if [ ! -a /etc/nginx/sites-enabled/tangerine.conf ]; then
  sudo cp ./tangerine.conf /etc/nginx/sites-enabled
fi

# couchdb
which_couchdb=`which couchdb`
if [ ! -z "$which_couchdb" ]; then
  echo "CouchDB already installed"
else
  sudo apt-get install python-software-properties -y
  sudo apt-add-repository ppa:couchdb/stable
  sudo apt-get update
  sudo apt-get install couchdb couchdb-bin couchdb-common -y
fi


# node
which_node=`which_node`
if [ ! -z "$which_node" ]; then
  echo "node already installed"
else
  sudo apt-get install nodejs nodejs-legacy -y
fi

# npm
which_npm=`which npm`
if [ ! -z "$which_npm" ]; then
  echo "npm already installed"
elif [ ! -z "$which_npm" ]; then
  sudo apt-get install npm -y
fi

# pm2
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

sudo service couchdb restart

pm2 start ecosystem.json


