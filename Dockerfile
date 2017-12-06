FROM node:8

EXPOSE 4200

RUN mkdir /tangerine
WORKDIR /tangerine

# Install server.
ADD server/package.json server/package.json
RUN cd /tangerine/server && npm install

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
# @TODO Add only what we need for yarn install.
ADD client/tangy-forms/ /tangerine/client/tangy-forms/
RUN cd /tangerine/client/tangy-forms && yarn install

#
# Add sources.
#

# TODO: Cleanup later.
# ADD client/tangy-forms/src /tangerine/client/tangy-forms/src

ADD client/app-updater/src /tangerine/client/app-updater/src
ADD client/app-updater/index.html /tangerine/client/app-updater/index.html

ADD client/shell/src /tangerine/client/shell/src
ADD client/shell/Gulpfile.js /tangerine/client/shell/Gulpfile.js
ADD client/shell/proxy.conf.json /tangerine/client/shell/proxy.conf.json
ADD client/shell/tslint.json /tangerine/client/shell/tslint.json
ADD client/shell/tsconfig.json /tangerine/client/shell/tsconfig.json
ADD client/shell/.angular-cli.json /tangerine/client/shell/.angular-cli.json

# Build.
RUN cd /tangerine/client/shell && ./node_modules/.bin/ng build --base-href /tangerine/
RUN cd /tangerine/client/tangy-forms && yarn build 
RUN cd /tangerine/client/app-updater && npm run build
ADD logo.svg /tangerine/client/build/logo.svg
RUN cp -r /tangerine/client/app-updater/build/default/* /tangerine/client/build/ && \
  ln -s /tangerine/client/tangy-forms/dist /tangerine/client/build/tangy-forms

# Add server.
ADD server/index.js server/index.js

# Add server default config.
ADD server/config.yml server/config.yml

# Add content.
ADD client/content /tangerine/client/content
RUN cp -r /tangerine/client/content /tangerine/client/build/

# Add workbox configuration for generating service workers on releases.
ADD client/workbox-cli-config.js /tangerine/client/workbox-cli-config.js

# Entrypoint.
ADD entrypoint.sh entrypoint.sh
ENTRYPOINT ./entrypoint.sh
