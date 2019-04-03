# Start with docker-tangerine-support, which provides the core Tangerine apps.
FROM tangerine/docker-tangerine-base-image:v3-node-base-with-wrapper

# Never ask for confirmations
ENV DEBIAN_FRONTEND noninteractive
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Install global node dependencies
RUN npm install -g nodemon dat

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

# Install server.
ADD ./server/package.json /tangerine/server/package.json
RUN cd /tangerine/server && \
    npm install

# Install editor.
ADD ./editor/package.json /tangerine/editor/package.json
RUN cd /tangerine/editor && \
    npm install

# Install client
ADD client/pwa-tools/service-worker-generator/package.json /tangerine/client/pwa-tools/service-worker-generator/package.json
ADD client/pwa-tools/service-worker-generator/workbox-cli-config.js /tangerine/client/pwa-tools/service-worker-generator/workbox-cli-config.js
ADD client/package.json /tangerine/client/package.json
ADD client/pwa-tools/updater-app/package.json /tangerine/client/pwa-tools/updater-app/package.json
ADD client/pwa-tools/updater-app/bower.json /tangerine/client/pwa-tools/updater-app/bower.json
RUN cd /tangerine/client/ && \
    npm install && \
    cd /tangerine/client/pwa-tools/service-worker-generator && \
    npm install && \
    cd /tangerine/client/pwa-tools/updater-app && \
    npm install && \
    ./node_modules/.bin/bower install --allow-root

# Build editor 
ADD editor /tangerine/editor
RUN cd /tangerine/editor && ./node_modules/.bin/ng build --base-href "./"
RUN cd /tangerine/editor && ./node_modules/.bin/workbox generate:sw 


# Build client
ADD client /tangerine/client
RUN cd /tangerine/client && \
    ./node_modules/.bin/ng build --base-href "./" && \
    cd /tangerine/client/pwa-tools/updater-app && \
    npm run build && \
    cp logo.svg build/default/ && \
    cd /tangerine/client && \
    cp -r dist/tangerine-client builds/apk/www/shell && \
    cp -r pwa-tools/updater-app/build/default builds/pwa && \
    mkdir builds/pwa/release-uuid && \
    cp -r dist/tangerine-client builds/pwa/release-uuid/app

# Add the rest of server.
ADD server /tangerine/server

# Link up global commands.
RUN cd /tangerine/server && \
    npm link


#
# Wrap up 
#

ADD ./ /tangerine

RUN mkdir /csv
RUN mkdir /groups
RUN echo {} > /paid-worker-state.json

EXPOSE 80
ENTRYPOINT cd /tangerine/server/ && npm start 
