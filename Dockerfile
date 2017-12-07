FROM node:8

EXPOSE 4200

RUN mkdir /tangerine
WORKDIR /tangerine

RUN apt-get update && apt-get -y install nginx vim

RUN npm install -g nodemon

# Install server.
ADD server/package.json server/package.json
RUN cd /tangerine/server && npm install

# Install editor.
ADD server/editor/package.json server/editor/package.json
RUN cd /tangerine/server/editor && npm install

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
ADD client/tangy-forms/.yarnrc /tangerine/client/tangy-forms/.yarnrc
ADD client/tangy-forms/package.json /tangerine/client/tangy-forms/package.json
ADD client/tangy-forms/yarn.lock /tangerine/client/tangy-forms/yarn.lock
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
ADD client/tangy-forms/global-styles.js /tangerine/client/tangy-forms/global-styles.js
ADD client/tangy-forms/postcss.config.js /tangerine/client/tangy-forms/postcss.config.js
ADD client/tangy-forms/webpack.config.js /tangerine/client/tangy-forms/webpack.config.js
ADD client/tangy-forms/webpack-module-build.config.js /tangerine/client/tangy-forms/webpack-module-build.config.js
ADD client/tangy-forms/fonts /tangerine/client/tangy-forms/fonts
ADD client/tangy-forms/generators /tangerine/client/tangy-forms/generators
ADD client/tangy-forms/images /tangerine/client/tangy-forms/images
ADD client/tangy-forms/src /tangerine/client/tangy-forms/src

# Build.
RUN cd /tangerine/client/shell && ./node_modules/.bin/ng build --base-href /tangerine/
RUN cd /tangerine/client/tangy-forms && yarn build 
RUN cd /tangerine/client/app-updater && npm run build
ADD logo.svg /tangerine/client/build/logo.svg
RUN cp -r /tangerine/client/app-updater/build/default/* /tangerine/client/build/ && \
  cp -r /tangerine/client/shell/dist/ /tangerine/client/build/tangerine && \
  cp -r /tangerine/client/tangy-forms/dist /tangerine/client/build/tangy-forms

# Add server.
ADD server/index.js server/index.js

# Add server default config.
ADD server/config.yml server/config.yml

# Ad editor
ADD server/editor/Settings.js server/editor/Settings.js
ADD server/editor/Conf.js server/editor/Conf.js
ADD server/editor/microservices server/editor/microservices
ADD server/editor/middlewares server/editor/middlewares
ADD server/editor/src server/editor/src

# Add content.
ADD client/content /tangerine/client/content
RUN cp -r /tangerine/client/content /tangerine/client/build/
ADD projects /tangerine/projects

# Add workbox configuration for generating service workers on releases.
ADD client/workbox-cli-config.js /tangerine/client/workbox-cli-config.js

# Configure the nginx proxy server
ADD tangerine.conf tangerine.conf
RUN cp tangerine.conf /etc/nginx/sites-available/tangerine.conf \
&& ln -s /etc/nginx/sites-available/tangerine.conf /etc/nginx/sites-enabled/tangerine.conf \
&& rm /etc/nginx/sites-enabled/default \
&& sed -i "s/sendfile on;/sendfile off;\n\tclient_max_body_size 128M;/" /etc/nginx/nginx.conf

# Entrypoint.
ADD entrypoint.sh entrypoint.sh
ENTRYPOINT ./entrypoint.sh
