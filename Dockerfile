# Start with docker-tangerine-support, which provides the core Tangerine apps.
FROM ubuntu:14.04 

#
# ENV API for this container
#

# T_USER1 is the username of the first user you will log in as. It is also the super user that has all permissions. 
ENV T_USER1 user1
ENV T_USER1_PASSWORD password
# T_ADMIN is the admin user for your database. Make sure to change this so the outside world does not have access.
ENV T_ADMIN admin
ENV T_PASS password
# T_HOST_NAME is the URL without protocol (like http://) you will be accessing your Tangerine server at.
ENV T_HOST_NAME 127.0.0.1 
# If you have set up SSL on your server, you must change this to "https".
ENV T_PROTOCOL http
# Set to "development" for live code reload of editor and client.
ENV T_RUN_MODE production
# If true, this will run couchapp push again on all of your group databases. Good for making sure 
# your groups have the most recent updates but may cause Views to reindex when you don't want them to.
# WARNING: If set to true, you will need to manually update all of your group's `settings` and `configuration` docs because
# they will now be overwritten with defaults. This includes properties like the group's name.
ENV PUSH_COUCHAPP_TO_ALL_GROUPS_ON_ENTRYPOINT false

#
# Other ENVs 
#

# Never ask for confirmations
ENV DEBIAN_FRONTEND noninteractive
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Configure some things for use internally.
ENV T_TREE_HOSTNAME / 
ENV T_TREE_URL /tree 
ENV T_COUCH_HOST localhost
ENV T_COUCH_PORT 5984
ENV T_ROBBERT_PORT 4444
ENV T_TREE_PORT 4445
ENV T_BROCKMAN_PORT 4446
ENV T_DECOMPRESSOR_PORT 4447

#
# Stage 1 - Install global dependecies
#

ADD ./tangerine.conf /tangerine-server/tangerine.conf 

# Install some core utilities
RUN apt-get update && apt-get -y install \
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
    jq \
    libffi-dev

# Install node and some node based services
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash - \
  && apt-get -y install nodejs \
  && npm install -g pm2 \
  && npm install -g bower 

# Install and configure nginx
RUN apt-get -y install nginx \
  && cp /tangerine-server/tangerine.conf /etc/nginx/sites-available/tangerine.conf \
  && ln -s /etc/nginx/sites-available/tangerine.conf /etc/nginx/sites-enabled/tangerine.conf \
  && rm /etc/nginx/sites-enabled/default \
  && sed -i "s/sendfile on;/sendfile off;\n\tclient_max_body_size 128M;/" /etc/nginx/nginx.conf 


# Install Couchdb
RUN apt-get -y install software-properties-common \
  && apt-add-repository -y ppa:couchdb/stable \
  && apt-get update && apt-get -y install couchdb \
  && chown -R couchdb:couchdb /usr/lib/couchdb /usr/share/couchdb /etc/couchdb /usr/bin/couchdb \
  && chmod -R 0770 /usr/lib/couchdb /usr/share/couchdb /etc/couchdb /usr/bin/couchdb \
  && mkdir /var/run/couchdb \
  && chown -R couchdb /var/run/couchdb \
  && sed -i -e "s#\[couch_httpd_auth\]#\[couch_httpd_auth\]\ntimeout=9999999#" /etc/couchdb/local.ini \
  && sed -i 's#;bind_address = 127.0.0.1#bind_address = 0.0.0.0#' /etc/couchdb/local.ini \
  && couchdb -k \
  && couchdb -b

# Install couchapp
RUN apt-get install build-essential python-dev -y \
  && curl -O https://bootstrap.pypa.io/get-pip.py \
  && python get-pip.py \
  && pip install couchapp 

## Install Ruby
RUN gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 \
  && curl -L https://get.rvm.io | bash -s stable \
  && /bin/bash -l -c "rvm requirements" \
  && /bin/bash -l -c "rvm install ruby-2.2.0" \
  && /bin/bash -l -c "rvm install ruby-2.2.0-dev" \
  && /bin/bash -l -c "rvm --default use ruby-2.2.0" \
  && /bin/bash -c "source /usr/local/rvm/bin/rvm && gem install bundler --no-ri --no-rdoc "
ENV PATH /usr/local/rvm/rubies/ruby-2.2.0/bin:/usr/local/rvm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ENV GEM_PATH /usr/local/rvm/rubies/ruby-2.2.0
ENV GEM_HOME /usr/local/rvm/rubies/ruby-2.2.0

# Prepare to install Android Build Tools
ENV GRADLE_OPTS -Dorg.gradle.jvmargs=-Xmx2048m
ENV ANDROID_SDK_FILENAME android-sdk_r24.4.1-linux.tgz
ENV ANDROID_SDK_URL http://dl.google.com/android/${ANDROID_SDK_FILENAME}
# Support from Ice Cream Sandwich, 4.0.3 - 4.0.4, to Marshmallow version 6.0
ENV ANDROID_API_LEVELS android-15,android-16,android-17,android-18,android-19,android-20,android-21,android-22,android-23
# https://developer.android.com/studio/releases/build-tools.html
ENV ANDROID_BUILD_TOOLS_VERSION 23.0.3
ENV ANDROID_HOME /opt/android-sdk-linux
ENV PATH ${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/platform-tools

# Install jd7
RUN apt-get -y install default-jdk

# Install Android SDK
RUN cd /opt && \
    wget -q $ANDROID_SDK_URL && \
    tar -xzf $ANDROID_SDK_FILENAME && \
    rm $ANDROID_SDK_FILENAME && \
    echo y | android update sdk --no-ui -a --filter tools,platform-tools,$ANDROID_API_LEVELS,build-tools-$ANDROID_BUILD_TOOLS_VERSION,extra-android-support,extra-android-m2repository

# Install Cordova
RUN npm update && \
    npm install -g npm && \
    npm install -g cordova 



# 
# Stage 2 Install application dependencies
# 

# Install brockman.
ADD ./brockman/Gemfile /tangerine-server/brockman/Gemfile
ADD ./brockman/Gemfile.lock /tangerine-server/brockman/Gemfile.lock
RUN cd /tangerine-server/brockman \ 
    && gem install bundler --no-ri --no-rdoc \
    && bundle install --path vendor/bundle

# Install server.
ADD ./server/package.json /tangerine-server/server/package.json
RUN cd /tangerine-server/server \
    && npm install

# Install editor.
ADD ./editor/package.json /tangerine-server/editor/package.json
RUN cd /tangerine-server/editor \
    && npm install

# Install tree.
ADD ./tree/package.json /tangerine-server/tree/package.json
RUN cd /tangerine-server/tree \
    && npm install

# Install client.
ADD ./client/package.json /tangerine-server/client/package.json
ADD ./client/bower.json /tangerine-server/client/bower.json
ADD ./client/.bowerrc /tangerine-server/client/.bowerrc
ADD ./client/scripts/postinstall.sh /tangerine-server/client/scripts/postinstall.sh
ADD ./client/Gruntfile.js /tangerine-server/client/Gruntfile.js
ADD ./client/config.xml /tangerine-server/client/config.xml
RUN mkdir /tangerine-server/client/src
RUN mkdir /tangerine-server/client/www
ADD ./client/res /tangerine-server/client/res
RUN cd /tangerine-server/client \
    && sed -i'' -r 's/^( +, uidSupport = ).+$/\1false/' /usr/lib/node_modules/npm/node_modules/uid-number/uid-number.js 
RUN cd /tangerine-server/client \
    && npm install 
RUN cd /tangerine-server/client \
    && bower install --allow-root  

# Install cordova-plugin-whitelist otherwise the folllowing `cordova plugin add` fails with `Error: spawn ETXTBSY`.
RUN cd /tangerine-server/client \
    && ./node_modules/.bin/cordova platform add android@5.X.X \
    && npm install cordova-plugin-whitelist \
    && ./node_modules/.bin/cordova plugin add cordova-plugin-whitelist --save \
    && npm install cordova-plugin-geolocation \
    && ./node_modules/.bin/cordova plugin add cordova-plugin-geolocation --save \
    && ./node_modules/.bin/cordova plugin add cordova-plugin-crosswalk-webview --variable XWALK_VERSION="19+"
RUN cd /tangerine-server/client && npm run build:apk 

# Install Tangerine CLI
ADD ./cli/package.json /tangerine-server/cli/package.json
RUN cd /tangerine-server/cli \
    && npm install

# Install decompressor.
ADD ./decompressor/package.json /tangerine-server/decompressor/package.json
RUN cd /tangerine-server/decompressor \
    && npm install


#
# Stage 3 Compile 
# 

# Compile editor.
ADD ./editor /tangerine-server/editor
RUN cd /tangerine-server/editor && npm start init

# Engage the Tangerine CLI so we can run commands like `sudo tangerine make-me-a-sandwich`.
ADD ./cli /tangerine-server/cli
RUN cd /tangerine-server/cli && npm link

# Compile client. 
ADD ./client /tangerine-server/client
RUN cd /tangerine-server/client && npm run gulp init
RUN rm -r /tangerine-server/client/www
RUN ln -s /tangerine-server/client/src /tangerine-server/client/www 


# Add all of the rest of the code 
ADD ./ /tangerine-server

RUN mkdir /tangerine-server/logs

# Volumes
VOLUME /tangerine-server/logs
VOLUME /tangerine-server/tree/apks
VOLUME /var/lib/couchb/ 

EXPOSE 80

ENTRYPOINT /tangerine-server/entrypoint.sh
