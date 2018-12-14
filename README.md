# Tangerine

![Tangerine](http://static1.squarespace.com/static/55c4e56fe4b0852b09fa2f29/t/55c4ec18e4b0f8bc41c735ae/1461960019800/?format=1500w)

[![Build Status](https://travis-ci.org/Tangerine-Community/Tangerine.svg)](https://travis-ci.org/Tangerine-Community/Tangerine)

[![Stories in Ready](https://badge.waffle.io/Tangerine-Community/Tangerine.png?label=ready&title=Ready)](https://waffle.io/Tangerine-Community/Tangerine)

[![Join the chat at https://gitter.im/Tangerine-Community/Tangerine](https://badges.gitter.im/Tangerine-Community/Tangerine.svg)](https://gitter.im/Tangerine-Community/Tangerine?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Digitize your EGMA and EGRA data collection with Tangerine. Create your Assessments online, conduct them offline with the Tangerine Android App or any device with Google Chrome web browser. All results you collect can be exported as a spreadsheet. When you have updates to forms you can send out an Over the Air update. Tangerine has been used by over 30 organizations to conduct over 1 million assessments and surveys in over 50 countries and in 100 languages.



## User Stories
1. Subscription Owners use the Online Tangerine Hub App to create their own Tangerine Server which contains the online Tangerine Editor App. Tangerine is licensed as GNU GPL v3 and available to be installed on your own server.
2. Form Designers use Tangerine Editor App to create forms and send those forms as Tangerine Client Apps to their Assessors.
3. Assessors use Tangerine Client Apps to collect form responses while offline and later when online they upload form responses to Tangerine Editor.
4. Form Designers download form responses as CSV. Other optional reporting modules include logstash module for building dashboards with Elastic Search and Kibana as well as the Dat Output module for sharing data on the P2P Dat Network. 
5. Form Designers send out updates to forms as an Over the Air update to Tangerine Client Apps.

## Technical details 
A Tangerine Server can either be purchased online at Tangerine Hub or set up on your own server by following the instructions in the README.md file found in the Open Source Tangerine repository on Github. The Tangerine Editor App is deployed using Docker and built with Node.js, Express.js, Angular, Web Components, and CouchDB.  The Tangerine Client app, which the Tangerine Editor App releases, can be released either as a Progressive Web App (PWA), downloadable Android App (APK), or Dat Archive for use on the experimental Beaker/Bunsen Browsers. The Tangerine Client App is built using Angular, Web Components, and PouchDB. All options for releasing are enabled to receive Over The Air (OTA) updates for form content and application updates with the Dat option having experimental support for syncing OTA updates between devices while offline.

Forms in Tangerine are based on the tangy-form suite of Web Components (https://www.webcomponents.org/element/tangy-form). Forms can be edited in the online Tangy Editor App on their Tangerine Server using a WYSIWYG interface or for advanced editors, via basic HTML and Javascript code.

There is a pluggable reporting module framework built in currently with options to send outputs to CSV, Elastic Search, and Dat Archives. Dashboards are typically built using the "ELK" stack which is short for a combination of technologies known as Elastic Search, Logstash, and Kibana. 

## Installation
We recommend using AWS for hosting have documented detailed [instructions for AWS](docs/install-on-aws.md). Below are general instructions for installing on any machine.

SSH into your machine from a terminal, [install Docker](https://docs.docker.com/engine/installation/linux/ubuntulinux/), and then run the following commands. You'll need the version of the most recent release. Find that on the releases page [here](https://github.com/Tangerine-Community/Tangerine-server/releases).
```
# Get the software.
git clone https://github.com/tangerine-community/tangerine.git
cd tangerine
# See releases tab on github for versions.
git checkout <version tag>
# Create config.sh and edit to match your desired settings. Make sure to set `T_CONTAINER_NAME` to the same as what `<version tag>` in the prior commands.
cp config.defaults.sh config.sh
nano config.sh
# Start the software.
./start.sh
```

If your server restarts or the container stops, you can later run the `./start.sh` script in the Tangerine folder.

To use SSL, put an SSL enabled Reverse Proxy in front of Tangerine and set the `T_PROTOCOL` variable in `config.sh` to `https` before running `start.sh`. At RTI we use AWS's Elastic Load Balancer in front of Tangerine because it automatically renews and cycles SSL certificates for us. How to set this up is detailed in our [instructions for AWS](docs/install-on-aws.md).  If your Tangerine install is on a Digital Ocean Droplet, you can use their Load Balancers and configure them for SSL. See [How To Configure SSL Termination on DigitalOcean Load Balancers](https://www.digitalocean.com/community/tutorials/how-to-configure-ssl-termination-on-digitalocean-load-balancers).
Now visit your Tangerine installation at the IP address or hostname of your installation. In this configuration, the browser talks to the Load Balancer securely on Port 443 while the load balancer communicates with Tangerine Container on port 80 on a private network.

## Enable P2P offline sync
You can release your Tangerine Apps as dat archives and access them using [Beaker Browser](https://beakerbrowser.com/) on Mac, Windows (see afforable $100 Windows tablet https://goo.gl/JgZ5c3), and Linux. The major advantage to releasing your Tangerine app as a dat archive is that it can be synced between devices while offline. If you have Android tablets, you can install [Bunsen Browser](https://play.google.com/store/apps/details?id=org.bunsenbrowser&hl=en_US) however there is currently an [issue with offline sync](https://github.com/bunsenbrowser/bunsen/issues/27). 

To enable dat archives on your server, you will need to install nodejs and run `dat-party` from the host machine inside of a screen session. In the future we hope there will not be this extra step because there are some details to work out around Dat working inside of a Docker Container (https://github.com/datproject/dat/issues/858).

```
npm install -g dat dat-party
screen -R dat-party
cd tangerine/data/client/releases/prod/dat
dat-party
```
Then press `control-a` `control-d` to detach from the "screen session" and leave it running.


## Upgrade
Monitor https://github.com/Tangerine-Community/Tangerine/releases for new stable releases. Note that a "Pre-release" may not be stable, might corrupt your data, and there will not be an upgrade path for you.

SSH into your server and run the following commands.
```
cd Tangerine
git fetch origin
git checkout <version tag>
# Set up config.sh again.
cp config.sh config.sh_backup
cp config.defaults.sh config.sh
# Migrate settings from config backup to config.sh.
vim -O config.sh config.sh_backup
rm config.sh_backup
./start.sh
# Check for upgrade scripts that need to be run. Note that you can only run scripts that end in .sh and you need to 
# run every script between your prior version to version you have upgraded to. Also always check the release notes for
# any special instructions
docker exec -it tangerine ls /tangerine/upgrades
# Run an upgrade script.
docker exec -it tangerine /tangerine/upgrades/v2.0.0.sh
```

Note that if you have created groups already and you are now updating `T_HOST_NAME` or `T_PROTOCOL` in `config.sh`, you will manually need to edit the `settings` docs in each group. See [issue #114](https://github.com/Tangerine-Community/Tangerine/issues/114) for the status of this. 

## Local Content Development
Install [nodejs](https://nodejs.org/en/) and [git](https://git-scm.com/) on your local machine. Then run the following commands.
```
git clone https://github.com/tangerine-community/tangerine
cd tangerine
git checkout <most recent release version, ie. v3.0.0-rc5>
cd client/app
npm install
npm start
```
Then open http://localhost:4200 in your web browser. The content is found in the `tangerine/client/app/src/assets` directory. You can edit the content there or replace it with your own content repository.  You can find a video tutorial on this process [here](https://www.youtube.com/watch?v=YHpyOaRLWD4&t).

If the process has stopped, you can restart by running...

```
cd tangerine/client/app
npm start
```

To update to a new version of tangerine, run...

```
cd tangerine
git fetch
git checkout <new version listed in the releases tab on github>
cd client/app/
rm -r node_modules
npm install
npm start
```

## App Development

### Develop for Editor and Server 
```
git clone git@github.com:tangerine-community/tangerine
cd tangerine
cp config.defaults.sh config.sh
./develop.sh
```

Now open http://localhost/ in your web browser. To debug the node.js server, install [NiM](https://chrome.google.com/webstore/detail/nodejs-v8-inspector-manag/gnhhdgbaldcilmgcpfddgdbkhjohddkj), open it through your devtools and connect to port 9229.

### Develop for Client 
Prereqs include node 8+ and `npm install -g @angular/cli`.
```
git clone git@github.com:tangerine-community/tangerine
cd tangerine
cd client/app
npm install
npm start
```

View the app at http://localhost:4200.

If you are also developing the form library Tangy Form at the same time, you can symlink that repository into `node_modules` folder. For example...

```
rm -r node_modules/tangy-form
ln -s /Users/rjsteinert/Git/tangerine-community/tangy-form /Users/rjsteinert/Git/tangerine-community/tangerine/client/app/node_modules/tangy-form
```
It's nice that the Angular webpack dev server will reload your browser when making changes in the symlinked tangy-form folder.

## Trademark and License
Tangerine is a registered trademark of [RTI International](https://rti.org). This software is licensed under the [GPLv3 License](https://www.gnu.org/licenses/gpl-3.0.en.html).
