# Start with docker-tangerine-base-image, which provides the core Tangerine apps.
FROM tangerine/docker-tangerine-base-image:v3.7.4

RUN git config --global url."https://".insteadOf git://

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

#
# Wrap up 
#

ADD ./ /tangerine

RUN mkdir /csv
RUN mkdir /groups
RUN echo {} > /paid-worker-state.json

EXPOSE 80
ENTRYPOINT cd /tangerine/server/ && npm start 
