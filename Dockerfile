# Start with docker-tangerine-support, which provides the core Tangerine apps.
FROM ubuntu:14.04 

# Never ask for confirmations
ENV DEBIAN_FRONTEND noninteractive
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

ENV T_HOST_NAME 127.0.0.1 
ENV T_PROTOCOL http
ENV T_USER1 user1
ENV T_USER1_PASSWORD password
ENV T_TREE_HOSTNAME / 
ENV T_TREE_URL /tree 

# Set to "development" for live code reload of editor and client.
ENV T_RUN_MODE production

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
ADD ./build-scripts/1-install-global-dependencies.sh /tangerine-server/build-scripts/1-install-global-dependencies.sh 
ADD ./tangerine.conf /tangerine-server/tangerine.conf 
RUN /tangerine-server/build-scripts/1-install-global-dependencies.sh
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

# Install cordova-plugin-whitelist otherwise the folllowing `cordova plugin add` fails with `Error: spawn ETXTBSY`.
RUN cd /tangerine-server/client \
    && ./node_modules/.bin/cordova platform add android@5.X.X \
    && npm install cordova-plugin-whitelist \
    && ./node_modules/.bin/cordova plugin add cordova-plugin-whitelist --save
    && ./node_modules/.bin/cordova plugin add cordova-plugin-crosswalk-webview --variable XWALK_VERSION="19+" && \

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

# @todo Add all of the rest of the code too early because otherwise client compile doesn't pick up on the git repository it needs.
ADD ./ /tangerine-server
# Add the git repo so compile processes can pick up version number.
ADD ./.git /tangerine-server/.git
# Compile client. Run twice otherwise compile is incomplete. See #74.
ADD ./client /tangerine-server/client
RUN cd /tangerine-server/client && npm run gulp init
RUN cd /tangerine-server/client && npm run gulp init
RUN cd /tangerine-server/client && npm run build:apk 

# Compile editor.
ADD ./editor /tangerine-server/editor
RUN cd /tangerine-server/editor && npm start init
# Engage the Tangerine CLI so we can run commands like `sudo tangerine make-me-a-sandwich`.
ADD ./cli /tangerine-server/cli
RUN cd /tangerine-server/cli && npm link

VOLUME /tangerine-server/tree/apks
VOLUME /var/lib/couchb/ 

EXPOSE 80

ENTRYPOINT /tangerine-server/build-scripts/4-entrypoint.sh
