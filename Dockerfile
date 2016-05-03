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

# install nginx
RUN apt-get -y install nginx

# COPY tangerine-nginx.template /root/Tangerine-server/tangerine-nginx.template
COPY tangerine.conf /etc/nginx/sites-available/tangerine.conf

# nginx config
RUN ln -s /etc/nginx/sites-available/tangerine.conf /etc/nginx/sites-enabled/tangerine.conf
RUN rm /etc/nginx/sites-enabled/default
  # increase the size limit of posts
CMD sed -i "s/sendfile on;/sendfile off;\n\tclient_max_body_size 128M;/" /etc/nginx/nginx.conf
# RUN service nginx restart

COPY tangerine-env-vars.sh.defaults /root/Tangerine-server/tangerine-env-vars.sh
# RUN dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
RUN cp /root/Tangerine-server/tangerine-env-vars.sh /etc/profile.d/
# RUN source /etc/profile

# get top to work
RUN echo -e "\nexport TERM=xterm" >> ~/.bashrc

# Install Couchdb
RUN apt-get -y install software-properties-common
RUN apt-add-repository -y ppa:couchdb/stable
RUN apt-get update && apt-get -y install couchdb
RUN chown -R couchdb:couchdb /usr/lib/couchdb /usr/share/couchdb /etc/couchdb /usr/bin/couchdb
RUN chmod -R 0770 /usr/lib/couchdb /usr/share/couchdb /etc/couchdb /usr/bin/couchdb
RUN mkdir /var/run/couchdb
RUN chown -R couchdb /var/run/couchdb
RUN couchdb -k
RUN couchdb -b

# create server admin
RUN sh -c 'echo "$T_ADMIN = $T_PASS" >> /etc/couchdb/local.ini'
RUN couchdb -b

# Add the first user.
# RUN curl -HContent-Type:application/json -vXPUT "http://$T_ADMIN:$T_PASS@$T_COUCH_HOST:$T_COUCH_PORT/_users/org.couchdb.user:user1" --data-binary '{"_id": "org.couchdb.user:user1","name": "user1","roles": [],"type": "user","password": "password"}'
# RUN curl -HContent-Type:application/json -vXPUT "http://admin:password@localhost:5984/_users/org.couchdb.user:user1" --data-binary '{"_id": "org.couchdb.user:user1","name": "user1","roles": [],"type": "user","password": "password"}'

# couchapp
# RUN add-apt-repository "deb http://archive.ubuntu.com/ubuntu $(lsb_release -sc) main"
RUN apt-get update && apt-get install build-essential \
    python-dev -y
RUN curl -O https://bootstrap.pypa.io/get-pip.py
RUN python get-pip.py
RUN pip install couchapp

RUN apt-get install -y -q build-essential
RUN apt-get install -y \
    nano \
    wget \
    links \
    curl \
    rsync \
    bc \
    git \
    git-core \
    apt-transport-https \
    libxml2 \
    libxml2-dev \
    libcurl4-openssl-dev \
    openssl \
    sqlite3 \
    libsqlite3-dev
RUN apt-get install -y \
    gawk \
    libreadline6-dev \
    libyaml-dev \
    autoconf \
    libgdbm-dev \
    libncurses5-dev \
    automake \
    libtool \
    bison \
    libffi-dev

## Ruby
RUN gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
RUN curl -L https://get.rvm.io | bash -s stable
#Set env just in case
ENV PATH /usr/local/rvm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
RUN /bin/bash -l -c "rvm requirements"
# install ruby
RUN /bin/bash -l -c "rvm install ruby-2.2.0"
RUN /bin/bash -l -c "rvm install ruby-2.2.0-dev"
RUN /bin/bash -l -c "rvm --default use ruby-2.2.0"
RUN /bin/bash -c "source /usr/local/rvm/bin/rvm \
&& gem install bundler --no-ri --no-rdoc "

# Install jdk7
# RUN apt-get -y install oracle-java7-installer
RUN apt-get -y install default-jdk

# Install android sdk
RUN curl http://dl.google.com/android/android-sdk_r24.3.4-linux.tgz > tmp/android-sdk.tgz
RUN mkdir /usr/local/bin/android-sdk-linux
RUN tar xvf tmp/android-sdk.tgz -C /usr/local/bin
RUN chown -R root:root /usr/local/bin/android-sdk-linux
RUN chmod a+x /usr/local/bin/android-sdk-linux/tools/android
ENV PATH ${PATH}:/usr/local/bin/android-sdk-linux/tools:/usr/local/bin/android-sdk-linux/build-tools
RUN sh -c "echo \"export PATH=$PATH:/usr/local/bin/android-sdk-linux/tools:/usr/local/bin/android-sdk-linux/build-tools \nexport ANDROID_HOME=/usr/local/bin/android-sdk-linux\" > /etc/profile.d/android-sdk-path.sh"
RUN cd /usr/local/bin/android-sdk-linux/tools/ && echo y | /usr/local/bin/android-sdk-linux/tools/android update sdk -u -a --force -t "tools"
RUN cd /usr/local/bin/android-sdk-linux/tools/ && echo y | /usr/local/bin/android-sdk-linux/tools/android update sdk -u -a --force -t "platform-tools"
RUN cd /usr/local/bin/android-sdk-linux/tools/ && echo y | /usr/local/bin/android-sdk-linux/tools/android update sdk -u -a --force -t "android-22,build-tools-23.0.2"

# Installs i386 architecture required for running 32 bit Android tools
RUN dpkg --add-architecture i386 && \
    apt-get update -y && \
    apt-get install -y \
    libc6:i386 \
    libncurses5:i386 \
    libstdc++6:i386 \
    lib32z1 && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get autoremove -y && \
    apt-get clean

EXPOSE 80

ADD ./ /root/Tangerine-server
RUN /root/Tangerine-server/server-init.sh

ENTRYPOINT /root/Tangerine-server/entrypoint.sh
