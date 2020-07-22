# Tangerine

![Tangerine](http://static1.squarespace.com/static/55c4e56fe4b0852b09fa2f29/t/5caccebdeef1a1d189644216/1554823454410/?format=110w)

[![Build Status](https://travis-ci.org/Tangerine-Community/Tangerine.svg?branch=master)](https://travis-ci.org/Tangerine-Community/Tangerine)

[![Join the chat at https://gitter.im/Tangerine-Community/Tangerine](https://badges.gitter.im/Tangerine-Community/Tangerine.svg)](https://gitter.im/Tangerine-Community/Tangerine?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Digitize your EGMA and EGRA data collection with Tangerine&trade;. Create your Assessments online, conduct them offline with the Tangerine Android App or any device with Google Chrome web browser. All results you collect can be exported as a spreadsheet. When you have updates to forms you can send out an Over the Air update. Tangerine has been used by over 60 organizations to conduct over 1 million assessments and surveys in over 70 countries and in 100 languages.

[See here for a link to the Tangerine Manual](http://www.tangerinecentral.org/product-help)

## User Stories
1. Subscription Owners use the Online Tangerine Hub App to create their own Tangerine Server which contains the online Tangerine Editor App. Tangerine is licensed as GNU GPL v3 and available to be installed on your own server.
2. Form Designers use Tangerine Editor App to create forms and send those forms as Tangerine Client Apps to their Assessors.
3. Assessors use Tangerine Client Apps to collect form responses while offline and later when online they upload form responses to Tangerine Editor.
4. Form Designers download form responses as CSV. Other optional reporting modules include logstash module for building dashboards with Elastic Search and Kibana as well as the Dat Output module for sharing data on the P2P Dat Network. 
5. Form Designers send out updates to forms as an Over the Air update to Tangerine Client Apps.

## Technical details 
A Tangerine Server can either be purchased online at Tangerine Hub or set up on your own server by following the instructions in the README.md file found in the Open Source Tangerine repository on Github. The Tangerine Editor App is deployed using Docker and built with Node.js, Express.js, Angular, Web Components, and CouchDB.  The Tangerine Client app, which the Tangerine Editor App releases, can be released either as a Progressive Web App (PWA), downloadable Android App (APK), or Dat Archive for use on the experimental Beaker/Bunsen Browsers. The Tangerine Client App is built using Angular, Web Components, and PouchDB. All options for releasing are enabled to receive Over The Air (OTA) updates for form content and application updates with the Dat option having experimental support for syncing OTA updates between devices while offline.

Forms in Tangerine are based on the tangy-form suite of Web Components (<https://www.webcomponents.org/element/tangy-form>). Forms can be edited in the online Tangy Editor App on their Tangerine Server using a WYSIWYG interface or for advanced editors, via basic HTML and Javascript code.

There is a pluggable reporting module framework built in currently with options to send outputs to CSV, Elastic Search, and Dat Archives. Dashboards are typically built using the "ELK" stack which is short for a combination of technologies known as Elastic Search, Logstash, and Kibana. 

## Supported Devices and Web Browsers

### Online Editor for Form Design and Data Download
Currently Tangerine Editor is tested using Google Chrome web browser. Other Web Browsers such as Firefox and Edge may work, but may also give you trouble. 

### Offline Tablet for data collection
Currently the most commonly deployed tablet with Tangerine is the [Lenovo Tab 4 8](https://www.lenovo.com/us/en/tablets/android-tablets/tab-4-series/Lenovo-TB-8504/p/ZA2B0009US). Technically any Android tablet with an updated version of Chrome should work but due to the varied nature of Android distributions out there, we cannot guarantee Tangerine will work on all Android tablets.

## Installation

### Server
We recommend using AWS for hosting have documented detailed [instructions for AWS](docs/install-on-aws.md). Below are general instructions for installing on any machine.

__Step 1__: SSH into your machine from a terminal.

__Step 2__: [Install Docker](https://docs.docker.com/install/linux/docker-ce/ubuntu/), 

__Step 3__: Configure Docker to not fill up the hard drive with logs.

Create `/etc/docker/daemon.json` with the following contents.
```
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3",
    "labels": "production_status",
    "env": "os,customer"
  }
}
```

Then restart the daemon with `sudo service docker restart`.

__Step 4__: Configure SSL

To use SSL, put an SSL enabled Reverse Proxy in front of Tangerine and set the `T_PROTOCOL` variable in `config.sh` to `https` before running `start.sh`. Note that in order to publish Tangerine for data collection using the Web App method (PWA), SSL is required. At RTI we use AWS's Elastic Load Balancer in front of Tangerine because it automatically renews and cycles SSL certificates for us. How to set this up is detailed in our [instructions for AWS](docs/install-on-aws.md).  If your Tangerine install is on a Digital Ocean Droplet, you can use their Load Balancers and configure them for SSL. See [How To Configure SSL Termination on DigitalOcean Load Balancers](https://www.digitalocean.com/community/tutorials/how-to-configure-ssl-termination-on-digitalocean-load-balancers).
Now visit your Tangerine installation at the IP address or hostname of your installation. In this configuration, the browser talks to the Load Balancer securely on Port 443 while the load balancer communicates with Tangerine Container on port 80 on a private network.

__Step 5__: Install Tangerine

You'll need the version of the most recent release. Find that on the releases page [here](https://github.com/Tangerine-Community/Tangerine-server/releases), note the release number and use it to replace all instances of `<version tag>` in the commands below.
```
# Get the software.
git clone https://github.com/tangerine-community/tangerine.git
cd tangerine
# See releases tab on github for versions.
git checkout <version tag>
# Create config.sh and change all required settings.
cp config.defaults.sh config.sh
nano config.sh
# Start the software.
./start.sh <version tag>
```

__Step 6__: Keep Tangerine alive with cron

To reset caches and free up memory every so often, we recommend restarting the server every evening using cron to automate it. As a user with docker permission on the command line run `crontab -e` and add the following line. Also added to this cron is an entry to start tangerine in case the machine is rebooted.
```
0 0 * * * docker stop tangerine && docker start tangerine
@reboot docker start couchdb && sleep 10 && docker start tangerine
```

### Tablet
To install on Tablets, proceed to the "Releases" tab in the Online Editor. There you will find two methods for installing on Tablets, Web Browser Installation and Android Installation. Each of these release types have two different channels you can publish to, Test and Live. It is recommended that for every deployment of Tangerine you have at least one designated device subscribed to the Test channel so that you may release to that Device to test Tangerine upgrades and content updates before releasing to the remaining tablets subscribed to the Live channel.

0. On Tablet, open the Play Store app and proceed to upgrade Google Chrome Web Browser.
0. On Server, generate release in Online Editor.
0. If using Web Browser Installation, ensure the Tablet is connected to the Internet, open the URL the server gives you in Google Chrome, wait for installation screen to complete, and then tap "Add to homescreen" to add the App to your device. If using Android installation download the "APK" file, transfer to the device and open the file to install.
0. If using the Android Installation, on the Tablet proceed to the Settings App and open "Apps & notifcations", then "Tangerine", then "Permissions". Ensure that "Camera", "Location", and "Storage" permissions are enabled.

## Upgrade
When you start Tangerine, it creates two containers that need upgrades over time. The `tangerine` container and the `couchdb` container. 

### Server Upgrades
Monitor <https://github.com/Tangerine-Community/Tangerine/releases> for new stable releases. Note that a "Pre-release" may not be stable, might corrupt your data, and there will not be an upgrade path for you.

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
./start.sh <version number>
# Check for upgrade scripts that need to be run. Note that you can only run scripts that end in .sh and you need to 
# run every script between your prior version to version you have upgraded to. Also always check the release notes for
# any special instructions
docker exec -it tangerine ls /tangerine/upgrades
# Run an upgrade script indicated in release instructions.
docker exec -it tangerine /tangerine/upgrades/<version>.sh
# Remove the previous version of tangerine you had installed.
docker rmi tangerine/tangerine:<previous tag>
```

Note that if you have created groups already and you are now updating `T_HOST_NAME` or `T_PROTOCOL` in `config.sh`, you will manually need to edit the `settings` docs in each group. See [issue #114](https://github.com/Tangerine-Community/Tangerine/issues/114) for the status of this. 

### CouchDB Upgrades
Periodically CouchDB will issue security vulnerability fixes. Subscribe to their blog to be notified of releases (<http://blog.couchdb.org>) and then run the following commands.

```
docker pull couchdb
cd tangerine
./start.sh
```


### Tablet Upgrades
For the app on the tablet, wether you are using the Android Installation method or the Web Browser installation method, the update process is the same. After server upgrades or content changes, return to the "Releases" tab in the online Editor and click "Test Release". When that completes, fetch your designated test tablet. Ensure you have an Internet connection on your designated test tablet, open the app, log in, and from the top right menu select "Check for Update". Follow the prompts to update. If the updates are satisfactory, return to your "Releases" tab online and click "Live Release". Proceed to update your Tablets with the "Live Release" app.

## Local Content Development
Install [nodejs](https://nodejs.org/en/) and [git](https://git-scm.com/) on your local machine. Then run the following commands.
```
git clone https://github.com/tangerine-community/tangerine
cd tangerine
git checkout <most recent release version, ie. v3.0.0-rc5>
cd client/
npm install
npm start
```
Then open <http://localhost:4200> in your web browser. The content is found in the `tangerine/client/src/assets` directory. You can edit the content there or replace it with your own content repository.  You can find a video tutorial on this process [here](https://www.youtube.com/watch?v=YHpyOaRLWD4&t).

If the process has stopped, you can restart by running...

```
cd tangerine/client/
npm start
```

To update to a new version of tangerine, run...

```
cd tangerine
git fetch
git checkout <new version listed in the releases tab on github>
cd client/
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

Now open <http://localhost/> in your web browser. To debug the node.js server, install [NiM](https://chrome.google.com/webstore/detail/nodejs-v8-inspector-manag/gnhhdgbaldcilmgcpfddgdbkhjohddkj), open it through your devtools and connect to port 9229.

### Develop for Client 
Prereqs include node and `npm install -g @angular/cli`. 
```
git clone git@github.com:tangerine-community/tangerine
cd tangerine/client/
cp -r default-assets src/assets
npm install
npm start
```

View the app at <http://localhost:4200>.

If you are also developing the form library Tangy Form at the same time, you can symlink that repository into `node_modules` folder. For example...

```
rm -r node_modules/tangy-form
ln -s /Users/rjsteinert/Git/tangerine-community/tangy-form /Users/rjsteinert/Git/tangerine-community/tangerine/client/node_modules/tangy-form
```
It's nice that the Angular webpack dev server will reload your browser when making changes in the symlinked tangy-form folder.

If you are developing PWA's and want to test locally, or if you are testing APK's and want to update the content easily while doing local development (because the APK's basically act as a container for the PWA's), use [ngrok](https://ngrok.com/) to create an https tunnel to your local code. Be sure to modify T_HOST_NAME and T_PROTOCOL in config.sh.

```
T_HOST_NAME='123random.ngrok.io'
T_PROTOCOL="https"
```

## Deprecated Version of Tangerine

Some projects are still using the deprecated v2 version of Tangerine. If you need to install this version, use the `v2.2.5-couchdb-1.7.2-e` Docker image.

## Trademark and License
Tangerine Logo is a registered trademark of [RTI International](https://rti.org). This software is licensed under the [GPLv3 License](https://www.gnu.org/licenses/gpl-3.0.en.html).
