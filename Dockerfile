# Start with docker-tangerine-support, which provides the core Tangerine apps.
FROM ubuntu:14.04 

# Never ask for confirmations
ENV DEBIAN_FRONTEND noninteractive
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

ENV T_HOST_NAME local.tangerinecentral.org
ENV T_PROTOCOL https
ENV T_NEW_ADMIN admin
ENV T_NEW_ADMIN_PASS password
ENV T_USER1 user1
ENV T_USER1_PASSWORD password
ENV T_TREE_HOSTNAME bigtree.tangerinecentral.org
ENV T_TREE_URL http://bigtree.tangerinecentral.org

ENV T_ADMIN admin
ENV T_PASS password
ENV T_COUCH_HOST localhost
ENV T_COUCH_PORT 5984
ENV T_ROBBERT_PORT 4444
ENV T_TREE_PORT 4445
ENV T_BROCKMAN_PORT 4446
ENV T_DECOMPRESSOR_PORT 4447

# Stage 1
ADD ./1-install-global-dependencies.sh /tangerine-server/1-install-global-dependencies.sh 
ADD ./tangerine.conf /tangerine-server/tangerine.conf 
RUN /tangerine-server/1-install-global-dependencies.sh
ENV PATH /usr/local/rvm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Stage 2
ADD ./brockman/Gemfile /tangerine-server/brockman/Gemfile
ADD ./brockman/Gemfile.lock /tangerine-server/brockman/Gemfile.lock
ADD ./robbert/package.json /tangerine-server/robbert/package.json
ADD ./editor/package.json /tangerine-server/editor/package.json
ADD ./decompressor/package.json /tangerine-server/decompressor/package.json
ADD ./2-install-application-dependencies.sh /tangerine-server/2-install-application-dependencies.sh
RUN /tangerine-server/2-install-application-dependencies.sh

# Stage 3
ADD ./ /tangerine-server
RUN /tangerine-server/3-compile-code.sh

EXPOSE 80

ENTRYPOINT /tangerine-server/4-entrypoint.sh
