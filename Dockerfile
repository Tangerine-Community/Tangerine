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

# Stage 1
ADD ./build-scripts/1-install-global-dependencies.sh /tangerine-server/build-scripts/1-install-global-dependencies.sh 
ADD ./tangerine.conf /tangerine-server/tangerine.conf 
RUN /tangerine-server/build-scripts/1-install-global-dependencies.sh
ENV PATH /usr/local/rvm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Stage 2
ADD ./brockman/Gemfile /tangerine-server/brockman/Gemfile
ADD ./brockman/Gemfile.lock /tangerine-server/brockman/Gemfile.lock
ADD ./robbert/package.json /tangerine-server/robbert/package.json
ADD ./editor/package.json /tangerine-server/editor/package.json
ADD ./decompressor/package.json /tangerine-server/decompressor/package.json
ADD ./build-scripts/2-install-application-dependencies.sh /tangerine-server/build-scripts/2-install-application-dependencies.sh
RUN /tangerine-server/build-scripts/2-install-application-dependencies.sh

# Stage 3
ADD ./editor /tangerine-server/editor
ADD ./build-scripts/3-compile-code.sh /tangerine-server/build-scripts/3-compile-code.sh
RUN /tangerine-server/build-scripts/3-compile-code.sh
ADD ./ /tangerine-server

EXPOSE 80

ENTRYPOINT /tangerine-server/build-scripts/4-entrypoint.sh
