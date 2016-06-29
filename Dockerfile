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

# TREEEEEEE

# Install some core utilities
RUN apt-get update && apt-get -y install \
    software-properties-common \
    python-software-properties \
    bzip2 unzip \
    openssh-client \
    git \
    lib32stdc++6 \
    lib32z1 \
    curl \
    wget \
    vim

RUN curl -sL https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get -y install nodejs



ADD ./tree /root/Tangerine-tree

# Install jdk7
# RUN apt-get -y install oracle-java7-installer
RUN apt-get update && apt-get -y install default-jdk

# Install android sdk
#RUN curl http://dl.google.com/android/android-sdk_r24.3.4-linux.tgz > tmp/android-sdk.tgz
#RUN mkdir /usr/local/bin/android-sdk-linux
#RUN tar xvf tmp/android-sdk.tgz -C /usr/local/bin
#RUN chown -R root:root /usr/local/bin/android-sdk-linux
#RUN chmod a+x /usr/local/bin/android-sdk-linux/tools/android
#ENV PATH ${PATH}:/usr/local/bin/android-sdk-linux/tools:/usr/local/bin/android-sdk-linux/build-tools
#RUN sh -c "echo \"export PATH=$PATH:/usr/local/bin/android-sdk-linux/tools:/usr/local/bin/android-sdk-linux/build-tools \nexport ANDROID_HOME=/usr/local/bin/android-sdk-linux\" > /etc/profile.d/android-sdk-path.sh"
#RUN cd /usr/local/bin/android-sdk-linux/tools/ && echo y | /usr/local/bin/android-sdk-linux/tools/android update sdk -u -a --force -t "tools"
#RUN cd /usr/local/bin/android-sdk-linux/tools/ && echo y | /usr/local/bin/android-sdk-linux/tools/android update sdk -u -a --force -t "platform-tools"
#RUN cd /usr/local/bin/android-sdk-linux/tools/ && echo y | /usr/local/bin/android-sdk-linux/tools/android update sdk -u -a --force -t "android-22,build-tools-23.0.2"

# Installs Android SDK
ENV ANDROID_SDK_FILENAME android-sdk_r24.4.1-linux.tgz
ENV ANDROID_SDK_URL http://dl.google.com/android/${ANDROID_SDK_FILENAME}
# Support from Ice Cream Sandwich, 4.0.3 - 4.0.4, to Marshmallow version 6.0
ENV ANDROID_API_LEVELS android-15,android-16,android-17,android-18,android-19,android-20,android-21,android-22,android-23
# https://developer.android.com/studio/releases/build-tools.html
ENV ANDROID_BUILD_TOOLS_VERSION 23.0.3
ENV ANDROID_HOME /opt/android-sdk-linux
ENV PATH ${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/platform-tools
#android list sdk -e
RUN cd /opt && \
    wget -q ${ANDROID_SDK_URL} && \
    tar -xzf ${ANDROID_SDK_FILENAME} && \
    rm ${ANDROID_SDK_FILENAME} && \
    echo y | android update sdk --no-ui -a --filter tools,platform-tools,${ANDROID_API_LEVELS},build-tools-${ANDROID_BUILD_TOOLS_VERSION},extra-android-support,extra-android-m2repository

# Installs i386 architecture required for running 32 bit Android tools
#RUN dpkg --add-architecture i386 && \
#    apt-get update -y && \
#    apt-get install -y \
#    libc6:i386 \
#    libncurses5:i386 \
#    libstdc++6:i386 \
#    lib32z1 && \
#    rm -rf /var/lib/apt/lists/* && \
#    apt-get autoremove -y && \
#    apt-get clean

# Installs Cordova
# Forces a platform add in order to preload libraries

RUN npm update && \
    npm install -g npm && \
    npm install -g cordova && \
    cd /tmp && \
    cordova create fakeapp && \
    cd /tmp/fakeapp && \
    cordova platform add android@5.X.X && \
    cordova plugin add cordova-plugin-crosswalk-webview --variable XWALK_VERSION="19+" && \
    cordova build android && \
    cd
#    cd && \
#    rm -rf /tmp/fakeapp

VOLUME /root/Tangerine-tree/tree/apks
RUN /root/Tangerine-tree/tree/server-init.sh


# Tree installed. Resume normal operations...

# Stage 1
ADD ./build-scripts/1-install-global-dependencies.sh /tangerine-server/build-scripts/1-install-global-dependencies.sh 
ADD ./tangerine.conf /tangerine-server/tangerine.conf 
RUN /tangerine-server/build-scripts/1-install-global-dependencies.sh
ENV PATH /usr/local/rvm/rubies/ruby-2.2.0/bin:/usr/local/rvm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ENV GEM_PATH /usr/local/rvm/rubies/ruby-2.2.0
ENV GEM_HOME /usr/local/rvm/rubies/ruby-2.2.0

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
