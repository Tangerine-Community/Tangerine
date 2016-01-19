# robbert

# apt-get update
if ! $updated_recently; then
  sudo apt-get update
  export updated_recently=TRUE
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

npm install

# curl
which_curl=`which curl`
if [ ! -z "$which_curl" ]; then
  echo "curl already installed"
else
  sudo apt-get install curl -y
fi

# couchapp
which_couchapp=`which couchapp`
if [ ! -z "$which_couchapp" ]; then
  echo "couchapp already installed"
else
  curl -O https://bootstrap.pypa.io/get-pip.py
  sudo python get-pip.py
  pip install couchapp
fi

cd couchapp && couchapp push
