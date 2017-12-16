FROM node:8

EXPOSE 4200

RUN mkdir /tangerine
WORKDIR /tangerine

# Install vim
RUN apt-get update && apt-get -y install vim

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

ADD client/tangy-forms/dist /tangerine/client/tangy-forms/dist
ADD client/tangy-forms/src /tangerine/client/tangy-forms/src
ADD client/tangy-forms/editor /tangerine/client/tangy-forms/editor
RUN cd /tangerine/client/tangy-forms && yarn run build

ADD client/app-updater/src /tangerine/client/app-updater/src
ADD client/app-updater/index.html /tangerine/client/app-updater/index.html
RUN cd /tangerine/client/app-updater && npm run build

ADD client/shell/src /tangerine/client/shell/src
ADD client/shell/Gulpfile.js /tangerine/client/shell/Gulpfile.js
ADD client/shell/proxy.conf.json /tangerine/client/shell/proxy.conf.json
ADD client/shell/tslint.json /tangerine/client/shell/tslint.json
ADD client/shell/tsconfig.json /tangerine/client/shell/tsconfig.json
ADD client/shell/.angular-cli.json /tangerine/client/shell/.angular-cli.json
RUN cd /tangerine/client/shell && ./node_modules/.bin/ng build --base-href /tangerine/ 

ADD server/index.js server/index.js
ADD server/editor.js server/editor.js

#
# Add static assets.
#

ADD client/content /tangerine/client/content
RUN cp -r /tangerine/client/content /tangerine/client/build/


#
# Glue build together.
#

RUN cp -r /tangerine/client/app-updater/build/default/* /tangerine/client/build/ && \
    cp -r /tangerine/client/shell/dist/ /tangerine/client/build/tangerine && \
    cp -r /tangerine/client/tangy-forms/dist /tangerine/client/build/tangy-forms

#
# Add configuration.
#

# Add server default config.
ADD server/config.yml server/config.yml

# Add workbox configuration for generating service workers on releases.
ADD client/workbox-cli-config.js /tangerine/client/workbox-cli-config.js

#
# Entrypoint.
#

ADD entrypoint.sh entrypoint.sh
ENTRYPOINT ./entrypoint.sh
