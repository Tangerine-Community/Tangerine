# Start with docker-tangerine-support, which provides the core Tangerine apps.
FROM node 

RUN npm install -g nodemon
RUN echo foo

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
ADD client/package.json /tangerine/client/package.json
ADD client/tangy-forms/package.json /tangerine/client/tangy-forms/package.json
ADD client/tangy-forms/yarn.lock /tangerine/client/tangy-forms/yarn.lock
ADD client/tangy-forms/bower.json /tangerine/client/tangy-forms/bower.json
ADD client/shell/package.json /tangerine/client/shell/package.json
ADD client/wrappers/pwa/package.json /tangerine/client/wrappers/pwa/package.json
ADD client/wrappers/pwa/bower.json /tangerine/client/wrappers/pwa/bower.json
ADD client/install.sh /tangerine/client/install.sh
RUN cd /tangerine/client/ && ./install.sh

# Build editor 
ADD editor /tangerine/editor
RUN cd /tangerine/editor && ./node_modules/.bin/ng build --base-href "./"

# Build client v3.
ADD client /tangerine/client
RUN cd /tangerine/client/ && ./build.sh


# Add the rest of server.
ADD server /tangerine/server

#
# Wrap up 
#

ADD ./ /tangerine
EXPOSE 80
ENTRYPOINT cd /tangerine/server/ && nodemon --legacy-watch index.js 
