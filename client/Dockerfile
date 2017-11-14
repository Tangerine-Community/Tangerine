FROM node:8

EXPOSE 4200 

RUN mkdir /tangerine
WORKDIR /tangerine

ADD app-updater/package.json app-updater/package.json
RUN cd app-updater && npm install
ADD shell/package.json shell/package.json
RUN cd shell && npm install
ADD tangy-forms/package.json tangy-forms/package.json
RUN cd tangy-forms && npm install

ADD app-updater/bower.json app-updater/bower.json
RUN cd app-updater && ./node_modules/.bin/bower --allow-root install
ADD tangy-forms/bower.json tangy-forms/bower.json
RUN cd tangy-forms && ./node_modules/.bin/bower --allow-root install

RUN npm install http-server

ADD tangy-forms/src tangy-forms/src 
ADD tangy-forms/index.html tangy-forms/index.html
ADD shell/src shell/src
ADD shell/Gulpfile.js shell/Gulpfile.js
ADD shell/proxy.conf.json shell/proxy.conf.json
ADD shell/tslint.json shell/tslint.json
ADD shell/tsconfig.json shell/tsconfig.json
ADD shell/.angular-cli.json shell/.angular-cli.json
ADD content content
ADD develop.sh develop.sh

ENTRYPOINT ./develop.sh
