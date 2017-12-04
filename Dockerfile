FROM node:8

EXPOSE 4200

RUN mkdir /tangerine
WORKDIR /tangerine

# Install root dependencies.
ADD client/package.json /tangerine/client/package.json
RUN cd /tangerine/client && npm install

# Install app-updater dependencies.
ADD client/app-updater/package.json /tangerine/client/app-updater/package.json
RUN cd /tangerine/client/app-updater && npm install
ADD client/app-updater/bower.json /tangerine/client/app-updater/bower.json
RUN cd /tangerine/client/app-updater && ./node_modules/.bin/bower --allow-root install

# Install shell dependencies.
ADD client/shell/package.json /tangerine/client/shell/package.json
RUN cd /tangerine/client/shell && npm install

# Install tangy-forms dependencies.
ADD client/tangy-forms/package.json /tangerine/client/tangy-forms/package.json
RUN cd /tangerine/client/tangy-forms && npm install
ADD client/tangy-forms/bower.json /tangerine/client/tangy-forms/bower.json
RUN cd /tangerine/client/tangy-forms && ./node_modules/.bin/bower --allow-root install

#
# Add sources.
#

ADD client/tangy-forms/src /tangerine/client/tangy-forms/src
ADD client/tangy-forms/index.html /tangerine/client/tangy-forms/index.html
ADD client/tangy-forms/global-styles.html /tangerine/client/tangy-forms/global-styles.html
ADD client/tangy-forms/fonts /tangerine/client/tangy-forms/fonts

ADD client/app-updater/src /tangerine/client/app-updater/src
ADD client/app-updater/index.html /tangerine/client/app-updater/index.html
ADD client/app-updater/logo.svg /tangerine/client/app-updater/logo.svg

ADD client/shell/src /tangerine/client/shell/src
ADD client/shell/Gulpfile.js /tangerine/client/shell/Gulpfile.js
ADD client/shell/proxy.conf.json /tangerine/client/shell/proxy.conf.json
ADD client/shell/tslint.json /tangerine/client/shell/tslint.json
ADD client/shell/tsconfig.json /tangerine/client/shell/tsconfig.json
ADD client/shell/.angular-cli.json /tangerine/client/shell/.angular-cli.json

# Build.
ADD client/build.sh /tangerine/client/build.sh
RUN cd /tangerine/client && ./build.sh

# Add content.
ADD client/content /tangerine/client/content
RUN cp -r /tangerine/client/content /tangerine/client/build/

# Generate release info.
ADD client/workbox-cli-config.js /tangerine/client/workbox-cli-config.js
RUN cd /tangerine/client/ \
  && ./node_modules/.bin/workbox generate:sw \
  && UUID=$(./node_modules/.bin/uuid) \
  && mv build/sw.js build/$UUID.js \
  && echo $UUID > build/release-uuid.txt \
  && echo "Release with UUID of $UUID"

# Entrypoint.
ADD entrypoint.sh entrypoint.sh
ENTRYPOINT ./entrypoint.sh
