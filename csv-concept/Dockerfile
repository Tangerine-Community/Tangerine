FROM node:7
RUN mkdir /www
WORKDIR /www
ADD ./package.json /www/package.json
RUN npm install
#RUN npm install -g nodemon
ADD ./index.js /www/index.js
ADD ./csv.js /www/csv.js
#ENTRYPOINT node --inspect index.js
ENTRYPOINT nodemon -L --watch csv.js --inspect=9229 index.js
