git submodule init
git submodule update

# apt-get update
if ! $updated_recently; then
  sudo apt-get update
  export updated_recently=TRUE
fi

# install nginx
which_nginx=`which nginx`
if [ ! -z "$which_nginx" ]; then
  echo "nginx already installed"
else
  sudo apt-get install nginx -y
fi

# nginx config
if [ ! -a /etc/nginx/sites-enabled/tangerine.conf ]; then
  sudo cp ./tangerine.conf /etc/nginx/sites-enabled
  sudo rm /etc/nginx/sites-enabled/default
  # increase the size limit of posts
  sudo sed -i "s/sendfile on;/sendfile off;\n\tclient_max_body_size 128M;/" /etc/nginx/nginx.conf
  sudo service nginx restart
fi

# link .tangerine's env vars
line=$(grep /.tangerine ~/.profile)
if [ $? -eq 1 ]; then
  dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
  cp $dir/.tangerine ~
  echo "source .tangerine" > ~/.profile
  vim ~/.tangerine
  source ~/.tangerine
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
which_node=`which node`
if [ ! -z "$which_node" ]; then
  echo "node already installed"
else
  curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi



# pm2
which_pm2=`which pm2`
if [ ! -z "$which_pm2" ]; then
  echo "pm2 already installed"
else
  sudo npm install -g pm2
fi

if [ -a ./tree/server-init.sh ]; then
  ./tree/server-init.sh
fi

if [ -a ./decompressor/server-init.sh ]; then
  ./decompressor/server-init.sh
fi

if [ -a ./brockman/server-init.sh ]; then
  ./brockman/server-init.sh
fi

if [ -a ./editor/server-init.sh ]; then
  ./editor/server-init.sh
fi

sudo service couchdb restart

sudo env PATH=$PATH:/usr/local/bin pm2 startup -u `whoami`

pm2 start ecosystem.json
