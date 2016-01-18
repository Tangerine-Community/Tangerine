# robbert

# node
which_npm=`which npm`
if [ ! -z "$which_npm" ]; then
  echo "npm already installed"
else
  sudo apt-get install nodejs nodejs-legacy npm -y
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
