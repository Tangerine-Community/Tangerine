# Start with docker-tangerine-base-image, which provides the core Tangerine apps.
FROM tangerine/docker-tangerine-base-image:v3.7.3

# Never ask for confirmations
ENV DEBIAN_FRONTEND noninteractive
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Install global node dependencies
# set unsafe-perm true allows it to work on ARM Macs(M1)
RUN npm config set unsafe-perm true
RUN npm install -g uuid couchdb-wedge
RUN npm config set unsafe-perm false

# Install helpful JSON utility.
RUN apt-get update && apt-get install -y jq 

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

# Install mysql integration dependencies.
RUN apt-get update && apt-get install -y python3-pip
ADD ./server/src/modules/mysql/install-dependencies.sh /tangerine/server/src/modules/mysql/install-dependencies.sh
RUN cd /tangerine/server/src/modules/mysql && \
    ./install-dependencies.sh

# Install online-survey-app.
ADD online-survey-app/package.json /tangerine/online-survey-app/package.json
RUN cd /tangerine/online-survey-app/ && \
    npm install

# Install server.
ADD ./server/package.json /tangerine/server/package.json
RUN cd /tangerine/server && \
    npm install

# Install editor.
ADD ./editor/package.json /tangerine/editor/package.json
RUN cd /tangerine/editor && \
    npm install

# Install client.
ADD client/package.json /tangerine/client/package.json
RUN cd /tangerine/client/ && \
    npm install

# Install PWA tools.
RUN git config --global url."git://".insteadOf https://
ADD client/pwa-tools/service-worker-generator/package.json /tangerine/client/pwa-tools/service-worker-generator/package.json
ADD client/pwa-tools/service-worker-generator/workbox-cli-config.js /tangerine/client/pwa-tools/service-worker-generator/workbox-cli-config.js
RUN cd /tangerine/client/pwa-tools/service-worker-generator && \
    npm install
ADD client/pwa-tools/updater-app/package.json /tangerine/client/pwa-tools/updater-app/package.json
ADD client/pwa-tools/updater-app/bower.json /tangerine/client/pwa-tools/updater-app/bower.json
RUN git config --global url."git://".insteadOf https://
RUN cd /tangerine/client/pwa-tools/updater-app && \
    npm install && \
    ./node_modules/.bin/bower install --allow-root

# Build online-survey-app.
ADD online-survey-app /tangerine/online-survey-app/
RUN cd /tangerine/online-survey-app && \
    ./node_modules/.bin/ng build --base-href "./"

# Build editor.
ADD editor /tangerine/editor
RUN cd /tangerine/editor && ./node_modules/.bin/ng build --base-href "./"
RUN cd /tangerine/editor && ./node_modules/.bin/workbox generate:sw 

# build client.
add client /tangerine/client
run cd /tangerine/client && \
    ./node_modules/.bin/ng build --base-href "./"

# Build PWA tools.
RUN cd /tangerine/client/pwa-tools/updater-app && \
    npm run build && \
    cp logo.svg build/default/

# Package release sources for APK and PWA.
RUN cd /tangerine/client && \
    cp -r dist/tangerine-client builds/apk/www/shell && \
    cp -r pwa-tools/updater-app/build/default builds/pwa && \
    mkdir builds/pwa/release-uuid && \
    cp -r dist/tangerine-client builds/pwa/release-uuid/app

# Modify links to javascript modules because they won't work in an APK (Angular 8 work-around)
RUN sed -i 's/type="module"/type="text\/javascript"/g' /tangerine/client/builds/apk/www/shell/index.html

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
