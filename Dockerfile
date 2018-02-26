# Start with docker-tangerine-support, which provides the core Tangerine apps.
FROM tangerine/docker-tangerine-base-image:v2_node8

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
# Stage 1 - Configure global dependecies
#

ADD ./tangerine.conf /tangerine-server/tangerine.conf
RUN cp /tangerine-server/tangerine.conf /etc/nginx/sites-available/tangerine.conf \
  && ln -s /etc/nginx/sites-available/tangerine.conf /etc/nginx/sites-enabled/tangerine.conf \
  && rm /etc/nginx/sites-enabled/default \
  && sed -i "s/sendfile on;/sendfile off;\n\tclient_max_body_size 128M;/" /etc/nginx/nginx.conf

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

## Install cordova-plugin-whitelist otherwise the folllowing `cordova plugin add` fails with `Error: spawn ETXTBSY`.
WORKDIR /tangerine-server/client
#RUN npm install cordova-plugin-whitelist
#RUN npm install cordova-plugin-geolocation
#RUN npm install cordova-plugin-camera
#RUN npm install cordova-plugin-crosswalk-webview

RUN cordova platform add android@6.3.0
RUN cordova plugin add cordova-plugin-whitelist --save
RUN cordova plugin add cordova-plugin-geolocation --save
RUN cordova plugin add cordova-plugin-camera --save
RUN cordova plugin add cordova-plugin-crosswalk-webview --save

RUN npm run build:apk

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
