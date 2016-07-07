# Start with docker-tangerine-support, which provides the core Tangerine apps.
FROM ubuntu:14.04 

# Never ask for confirmations
ENV DEBIAN_FRONTEND noninteractive
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

ENV T_HOST_NAME local.tangerinecentral.org
ENV T_PROTOCOL https
ENV T_USER1 user1
ENV T_USER1_PASSWORD password
ENV T_TREE_HOSTNAME bigtree.tangerinecentral.org
ENV T_TREE_URL https://bigtree.tangerinecentral.org

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
ADD ./build-scripts/1-install-global-dependencies.sh /tangerine-server/build-scripts/1-install-global-dependencies.sh 
ADD ./tangerine.conf /tangerine-server/tangerine.conf 
RUN /tangerine-server/build-scripts/1-install-global-dependencies.sh
ENV PATH /usr/local/rvm/rubies/ruby-2.2.0/bin:/usr/local/rvm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ENV GEM_PATH /usr/local/rvm/rubies/ruby-2.2.0
ENV GEM_HOME /usr/local/rvm/rubies/ruby-2.2.0

# 
# Stage 2 Install application dependencies
# 

ADD ./brockman/Gemfile /tangerine-server/brockman/Gemfile
ADD ./brockman/Gemfile.lock /tangerine-server/brockman/Gemfile.lock
ADD ./robbert/package.json /tangerine-server/robbert/package.json
ADD ./editor/package.json /tangerine-server/editor/package.json
ADD ./decompressor/package.json /tangerine-server/decompressor/package.json
ADD ./build-scripts/2-install-application-dependencies.sh /tangerine-server/build-scripts/2-install-application-dependencies.sh
ADD ./client/bower.json /tangerine-server/client/bower.json
ADD ./client/package.json /tangerine-server/client/package.json
RUN /tangerine-server/build-scripts/2-install-application-dependencies.sh

#
# Stage 3 Compile 
# 

# Add the git repo so compile processes can pick up version number.
ADD ./.git /tangerine-server/.git 
# Compile editor.
ADD ./editor /tangerine-server/editor
RUN cd /tangerine-server/editor && npm start init
# Compile client.
ADD ./client /tangerine-server/client
RUN cd /tangerine-server/client && npm run gulp init
# Run twice otherwise compile is incomplete. See #74.
RUN cd /tangerine-server/client && npm run gulp init
# Add all of the rest of the code.
ADD ./ /tangerine-server

EXPOSE 80

ENTRYPOINT /tangerine-server/build-scripts/4-entrypoint.sh
