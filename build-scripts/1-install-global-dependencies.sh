
set -v

# Install some core utilities
apt-get update && apt-get -y install \
    software-properties-common \
    python-software-properties \
    bzip2 unzip \
    openssh-client \
    git \
    lib32stdc++6 \
    lib32z1 \
    curl \
    wget \
    vim \
    nano \
    wget \
    links \
    curl \
    rsync \
    bc \
    git \
    git-core \
    apt-transport-https \
    libxml2 \
    libxml2-dev \
    libcurl4-openssl-dev \
    openssl \
    sqlite3 \
    libsqlite3-dev \
    gawk \
    libreadline6-dev \
    libyaml-dev \
    autoconf \
    libgdbm-dev \
    libncurses5-dev \
    automake \
    libtool \
    bison \
    libffi-dev


curl -sL https://deb.nodesource.com/setup_4.x | bash -
apt-get -y install nodejs

node -v
npm -v

npm install -g pm2
npm install -g bower

# install nginx
apt-get -y install nginx

# COPY tangerine-nginx.template /tangerine-server/tangerine-nginx.template
cp /tangerine-server/tangerine.conf /etc/nginx/sites-available/tangerine.conf

# nginx config
ln -s /etc/nginx/sites-available/tangerine.conf /etc/nginx/sites-enabled/tangerine.conf
rm /etc/nginx/sites-enabled/default
  # increase the size limit of posts
sed -i "s/sendfile on;/sendfile off;\n\tclient_max_body_size 128M;/" /etc/nginx/nginx.conf

cp /tangerine-server/tangerine-env-vars.sh.defaults /tangerine-server/tangerine-env-vars.sh
# dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cp /tangerine-server/tangerine-env-vars.sh /etc/profile.d/
# source /etc/profile

# get top to work
echo -e "\nexport TERM=xterm" >> ~/.bashrc

# Install jd7
apt-get -y install default-jdk

# Installs Android SDK
cd /opt && \
    wget -q $ANDROID_SDK_URL && \
    tar -xzf $ANDROID_SDK_FILENAME && \
    rm $ANDROID_SDK_FILENAME && \
    echo y | android update sdk --no-ui -a --filter tools,platform-tools,$ANDROID_API_LEVELS,build-tools-$ANDROID_BUILD_TOOLS_VERSION,extra-android-support,extra-android-m2repository

# Installs Cordova
# Forces a platform add in order to preload libraries
npm update && \
    npm install -g npm && \
    npm install -g cordova 

# Install Couchdb
apt-get -y install software-properties-common
apt-add-repository -y ppa:couchdb/stable
apt-get update && apt-get -y install couchdb
chown -R couchdb:couchdb /usr/lib/couchdb /usr/share/couchdb /etc/couchdb /usr/bin/couchdb
chmod -R 0770 /usr/lib/couchdb /usr/share/couchdb /etc/couchdb /usr/bin/couchdb
mkdir /var/run/couchdb
chown -R couchdb /var/run/couchdb
sed -i -e "s#\[couch_httpd_auth\]#\[couch_httpd_auth\]\ntimeout=9999999#" /etc/couchdb/local.ini
sed -i 's#;bind_address = 127.0.0.1#bind_address = 0.0.0.0#' /etc/couchdb/local.ini
couchdb -k
couchdb -b

# couchapp
# add-apt-repository "deb http://archive.ubuntu.com/ubuntu $(lsb_release -sc) main"
apt-get install build-essential python-dev -y 
curl -O https://bootstrap.pypa.io/get-pip.py
python get-pip.py
pip install couchapp

## Ruby
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
curl -L https://get.rvm.io | bash -s stable
#Set env just in case
/bin/bash -l -c "rvm requirements"
# install ruby
/bin/bash -l -c "rvm install ruby-2.2.0"
/bin/bash -l -c "rvm install ruby-2.2.0-dev"
/bin/bash -l -c "rvm --default use ruby-2.2.0"
/bin/bash -c "source /usr/local/rvm/bin/rvm && gem install bundler --no-ri --no-rdoc "

