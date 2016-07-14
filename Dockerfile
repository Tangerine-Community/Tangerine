# Start with docker-tangerine-support, which provides the core Tangerine apps.
FROM ubuntu:14.04 

# Never ask for confirmations
ENV DEBIAN_FRONTEND noninteractive
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

ENV T_HOST_NAME local.tangerinecentral.org
ENV T_PROTOCOL https
ENV T_USER1 user1
ENV T_USER1_PASSWORD password
ENV T_TREE_HOSTNAME / 
ENV T_TREE_URL /tree 

ENV T_ADMIN admin
ENV T_PASS password
ENV T_COUCH_HOST localhost
ENV T_COUCH_PORT 5984
ENV T_ROBBERT_PORT 4444
ENV T_TREE_PORT 4445
ENV T_BROCKMAN_PORT 4446
ENV T_DECOMPRESSOR_PORT 4447

#
# Stage 1 - Install global dependecies
#
ENV GRADLE_OPTS -Dorg.gradle.jvmargs=-Xmx2048m
ENV ANDROID_SDK_FILENAME android-sdk_r24.4.1-linux.tgz
ENV ANDROID_SDK_URL http://dl.google.com/android/${ANDROID_SDK_FILENAME}
# Support from Ice Cream Sandwich, 4.0.3 - 4.0.4, to Marshmallow version 6.0
ENV ANDROID_API_LEVELS android-15,android-16,android-17,android-18,android-19,android-20,android-21,android-22,android-23
# https://developer.android.com/studio/releases/build-tools.html
ENV ANDROID_BUILD_TOOLS_VERSION 23.0.3
ENV ANDROID_HOME /opt/android-sdk-linux
ENV PATH ${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/platform-tools
ADD ./tangerine.conf /tangerine-server/tangerine.conf 
ADD ./tangerine-env-vars.sh.defaults /tangerine-server/tangerine-env-vars.sh.defaults 
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
    libffi-dev


RUN curl -sL https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get -y install nodejs

RUN npm install -g pm2
RUN npm install -g bower

# install nginx
RUN apt-get -y install nginx

# COPY tangerine-nginx.template /tangerine-server/tangerine-nginx.template
RUN cp /tangerine-server/tangerine.conf /etc/nginx/sites-available/tangerine.conf

# nginx config
RUN ln -s /etc/nginx/sites-available/tangerine.conf /etc/nginx/sites-enabled/tangerine.conf
RUN rm /etc/nginx/sites-enabled/default
  # increase the size limit of posts
RUN sed -i "s/sendfile on;/sendfile off;\n\tclient_max_body_size 128M;/" /etc/nginx/nginx.conf

RUN cp /tangerine-server/tangerine-env-vars.sh.defaults /tangerine-server/tangerine-env-vars.sh
# dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
RUN cp /tangerine-server/tangerine-env-vars.sh /etc/profile.d/
# source /etc/profile

# get top to work
RUN echo -e "\nexport TERM=xterm" >> ~/.bashrc

# Install jd7
RUN apt-get -y install default-jdk

# Installs Android SDK
RUN cd /opt && \
    wget -q $ANDROID_SDK_URL && \
    tar -xzf $ANDROID_SDK_FILENAME && \
    rm $ANDROID_SDK_FILENAME && \
    echo y | android update sdk --no-ui -a --filter tools,platform-tools,$ANDROID_API_LEVELS,build-tools-$ANDROID_BUILD_TOOLS_VERSION,extra-android-support,extra-android-m2repository

# Installs Cordova
# Forces a platform add in order to preload libraries
RUN npm update && \
    npm install -g npm && \
    npm install -g cordova 

# Install Couchdb
RUN apt-get -y install software-properties-common
RUN apt-add-repository -y ppa:couchdb/stable
RUN apt-get update && apt-get -y install couchdb
RUN chown -R couchdb:couchdb /usr/lib/couchdb /usr/share/couchdb /etc/couchdb /usr/bin/couchdb
RUN chmod -R 0770 /usr/lib/couchdb /usr/share/couchdb /etc/couchdb /usr/bin/couchdb
RUN mkdir /var/run/couchdb
RUN chown -R couchdb /var/run/couchdb
RUN sed -i -e "s#\[couch_httpd_auth\]#\[couch_httpd_auth\]\ntimeout=9999999#" /etc/couchdb/local.ini
RUN sed -i 's#;bind_address = 127.0.0.1#bind_address = 0.0.0.0#' /etc/couchdb/local.ini
RUN couchdb -k
RUN couchdb -b

# couchapp
# add-apt-repository "deb http://archive.ubuntu.com/ubuntu $(lsb_release -sc) main"
RUN apt-get install build-essential python-dev -y 
RUN curl -O https://bootstrap.pypa.io/get-pip.py
RUN python get-pip.py
RUN pip install couchapp

## Ruby
RUN gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
RUN curl -L https://get.rvm.io | bash -s stable
#Set env just in case
RUN /bin/bash -l -c "rvm requirements"
# install ruby
RUN /bin/bash -l -c "rvm install ruby-2.2.0"
RUN /bin/bash -l -c "rvm install ruby-2.2.0-dev"
RUN /bin/bash -l -c "rvm --default use ruby-2.2.0"
RUN /bin/bash -c "source /usr/local/rvm/bin/rvm && gem install bundler --no-ri --no-rdoc "

ENV PATH /usr/local/rvm/rubies/ruby-2.2.0/bin:/usr/local/rvm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ENV GEM_PATH /usr/local/rvm/rubies/ruby-2.2.0
ENV GEM_HOME /usr/local/rvm/rubies/ruby-2.2.0

# 
# Stage 2 Install application dependencies
# 

# Install brockman.
ADD ./brockman/Gemfile /tangerine-server/brockman/Gemfile
ADD ./brockman/Gemfile.lock /tangerine-server/brockman/Gemfile.lock
RUN cd /tangerine-server/brockman \ 
    && gem install bundler --no-ri --no-rdoc \
    && bundle install --path vendor/bundle

# Install robbert.
ADD ./robbert/package.json /tangerine-server/robbert/package.json
RUN cd /tangerine-server/robbert \
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
ADD ./client/scripts/postinstall.sh /tangerine-server/client/scripts/postinstall.sh
ADD ./client/Gruntfile.js /tangerine-server/client/Gruntfile.js
ADD ./client/Gulpfile.js /tangerine-server/client/Gulpfile.js
ADD ./client/config.xml /tangerine-server/client/config.xml
RUN mkdir /tangerine-server/client/src
ADD ./client/www /tangerine-server/client/www
ADD ./client/res /tangerine-server/client/res
RUN cd /tangerine-server/client \
    && sed -i'' -r 's/^( +, uidSupport = ).+$/\1false/' /usr/lib/node_modules/npm/node_modules/uid-number/uid-number.js 
RUN cd /tangerine-server/client \
    && npm install 
RUN cd /tangerine-server/client \
    && bower install --allow-root  
RUN cd /tangerine-server/client \
    && npm run postinstall 

# Install decompressor.
ADD ./decompressor/package.json /tangerine-server/decompressor/package.json
RUN cd /tangerine-server/decompressor \
    && npm install


#
# Stage 3 Compile 
# 

# Add all of the rest of the code.
ADD ./ /tangerine-server
# Add the git repo so compile processes can pick up version number.
# ADD ./.git /tangerine-server/.git 
# Compile client. Run twice otherwise compile is incomplete. See #74.
# ADD ./client /tangerine-server/client
RUN cd /tangerine-server/client && npm run gulp init
RUN cd /tangerine-server/client && npm run gulp init
# Compile editor.
# ADD ./editor /tangerine-server/editor
RUN cd /tangerine-server/editor && npm start init

VOLUME /tangerine-server/tree/apks
VOLUME /var/lib/couchb/ 

EXPOSE 80

ENTRYPOINT /tangerine-server/build-scripts/4-entrypoint.sh
