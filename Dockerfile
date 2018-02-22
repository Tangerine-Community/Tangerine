# Start with docker-tangerine-support, which provides the core Tangerine apps.
FROM tangerine/docker-tangerine-base-image:latest

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
#RUN cd /tangerine-server/client \
#    && ./node_modules/.bin/cordova platform add android@5.X.X \
#    && npm install cordova-plugin-whitelist \
#    && ./node_modules/.bin/cordova plugin add cordova-plugin-whitelist --save \
#    && npm install cordova-plugin-geolocation \
#    && ./node_modules/.bin/cordova plugin add cordova-plugin-geolocation --save \
#    && npm install cordova-plugin-camera \
#    && ./node_modules/.bin/cordova plugin add cordova-plugin-camera --save \
#    && ./node_modules/.bin/cordova plugin add cordova-plugin-crosswalk-webview --variable XWALK_VERSION="19+"
#RUN cd /tangerine-server/client && npm run build:apk

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

#RUN apt-get update && apt-get -y install \
#    netcat-traditional

EXPOSE 80

ENTRYPOINT /tangerine-server/entrypoint.sh
