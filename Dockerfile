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
ADD client/containers/pwa/package.json /tangerine/client/containers/pwa/package.json
RUN cd /tangerine/client/containers/pwa && npm install
ADD client/containers/pwa/bower.json /tangerine/client/containers/pwa/bower.json
RUN cd /tangerine/client/containers/pwa && ./node_modules/.bin/bower --allow-root install

# Install shell dependencies.
ADD client/shell/package.json /tangerine/client/shell/package.json
RUN cd /tangerine/client/shell && npm install

# Install tangy-forms dependencies.
ADD client/tangy-forms/package.json /tangerine/client/tangy-forms/package.json
ADD client/tangy-forms/.npmrc /tangerine/client/tangy-forms/.npmrc
ADD client/tangy-forms/.yarnrc /tangerine/client/tangy-forms/.yarnrc
RUN cd /tangerine/client/tangy-forms && yarn install
ADD client/tangy-forms/bower.json /tangerine/client/tangy-forms/bower.json
RUN cd /tangerine/client/tangy-forms && ./node_modules/.bin/bower --allow-root install

#
# Add sources and build.
#

ADD client/tangy-forms/postcss.config.js /tangerine/client/tangy-forms/postcss.config.js
ADD client/tangy-forms/webpack.config.js /tangerine/client/tangy-forms/webpack.config.js
ADD client/tangy-forms/webpack-module-build.config.js /tangerine/client/tangy-forms/webpack-module-build.config.js
ADD client/tangy-forms/assets /tangerine/client/tangy-forms/assets
ADD client/tangy-forms/src /tangerine/client/tangy-forms/src
RUN cd /tangerine/client/tangy-forms && yarn run build

ADD client/container/pwa/src /tangerine/client/app-updater/src
ADD client/conainer/pwa/index.html /tangerine/client/app-updater/index.html
RUN cd /tangerine/client/container/pwa && npm run build

ADD client/shell/src /tangerine/client/shell/src
ADD client/shell/Gulpfile.js /tangerine/client/shell/Gulpfile.js
ADD client/shell/proxy.conf.json /tangerine/client/shell/proxy.conf.json
ADD client/shell/tslint.json /tangerine/client/shell/tslint.json
ADD client/shell/tsconfig.json /tangerine/client/shell/tsconfig.json
ADD client/shell/.angular-cli.json /tangerine/client/shell/.angular-cli.json
RUN cd /tangerine/client/shell && ./node_modules/.bin/ng build --base-href /tangerine/ 

ADD server/index.js server/index.js

#
# Add static assets.
#

ADD client/tangy-forms/assets /tangerine/client/tangy-forms/assets
ADD client/content /tangerine/client/content
ADD logo.svg /tangerine/client/build/logo.svg
RUN cp -r /tangerine/client/content /tangerine/client/build/


#
# Add configuration.
#

# Add server default config.
ADD server/config.yml server/config.yml

# Add workbox configuration for generating service workers on releases.
ADD client/workbox-cli-config.js /tangerine/client/workbox-cli-config.js

# Android build tools.
RUN npm install -g jszip-cli decompress-cli
ADD client/android client/android

#
# Entrypoint.
#

ADD entrypoint.sh entrypoint.sh
ENTRYPOINT ./entrypoint.sh
