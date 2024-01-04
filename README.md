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

Tangerine exposes a pluggable reporting module framework that monitors in-coming data from the Couchdb changes feed and outputs to optional modules. These modules parse each changed doc into flatter, easier-to-consume docs or transform and transfer to other databases. Current modules include: 
 - 'reporting' - produces flattened docs and consumed by our CSV output process
 - 'logstash' - transforms docs to support dashboards built using the "[ELK](https://www.elastic.co/elastic-stack)" stack - short for a combination of technologies known as Elastic Search, [Logstash](https://www.elastic.co/logstash), and Kibana
 - 'synapse' - transforms data closer to what a relational db would expect that uses a REST API to upload data to an Amazon S3 repository using [synapsePythonClient](https://github.com/Sage-Bionetworks/synapsePythonClient)
 - 'dat' - transforms docs for p2p via the [DatArchive API](https://beakerbrowser.com/docs/apis/dat)
 - 'rshiny' - produces flattened docs similar to the 'synapse' module using [sofa](https://github.com/ropensci/sofa) to support R reporting

A mysql database module is in-the-works.

## Supported Devices and Web Browsers

### Online Editor for Form Design and Data Download
Currently Tangerine Editor is tested using Google Chrome web browser. Other Web Browsers such as Firefox and Edge may work, but may also give you trouble. 

### Offline Tablet for data collection
Currently the most commonly deployed tablet with Tangerine is the [Lenovo Tab 4 8](https://www.lenovo.com/us/en/tablets/android-tablets/tab-4-series/Lenovo-TB-8504/p/ZA2B0009US). Technically any Android tablet with an updated version of Chrome should work but due to the varied nature of Android distributions out there, we cannot guarantee Tangerine will work on all Android tablets.

## Installation

### Server

__Step 1__: Create an Ubuntu Server and SSH into it from your machine from a terminal. See instructions for setting up a server on AWS [here](docs/system-administrator/install-on-aws.md).

__Step 2__: [Install Docker](https://docs.docker.com/install/linux/docker-ce/ubuntu/), 

__Step 3__: Configure Docker to not fill up the hard drive with logs.

Create `/etc/docker/daemon.json` with the following contents.
```json
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

To use SSL, put an SSL enabled Reverse Proxy in front of Tangerine and set the `T_PROTOCOL` variable in `config.sh` to `https` before running `start.sh`. Note that in order to publish Tangerine for data collection using the Web App method (PWA), SSL is required. Here are three ways of setting up an SSL enabled Reverse Proxy:
- At RTI we use AWS's Elastic Load Balancer in front of Tangerine because it automatically renews and cycles SSL certificates for us. How to set this up is detailed in our [instructions for AWS](docs/system-administrator/install-on-aws.md).  
- If your Tangerine install is on a Digital Ocean Droplet, you can use their Load Balancers and configure them for SSL. See [How To Configure SSL Termination on DigitalOcean Load Balancers](https://www.digitalocean.com/community/tutorials/how-to-configure-ssl-termination-on-digitalocean-load-balancers).
Now visit your Tangerine installation at the IP address or hostname of your installation. In this configuration, the browser talks to the Load Balancer securely on Port 443 while the load balancer communicates with Tangerine Container on port 80 on a private network. 
- You may also [install an nginx Docker container using Certbot](docs/system-administrator/tangerine-nginx-ssl.md).

__Step 5__: Install Tangerine

You'll need the version of the most recent release. Find that on the releases page [here](https://github.com/Tangerine-Community/Tangerine-server/releases), note the release number and use it to replace all instances of `<version tag>` in the commands below.
```bash
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

__Step 6__: Keep Tangerine alive, clear CSV downloads, and Ubuntu up to date with cron

The following crontab entries keep Tangerine and your server healthy and alive. Enter crontab for root with `sudo su && crontab -e` and add the following lines. 
```
# Clear CSV download folder. Only remove files older then 30 days. Adjust the +30 to increase or decrease the amount of days. 
0 5 * * * find /home/ubuntu/tangerine/data/csv/*  -type f -name '*' -mtime +30 -exec rm {} \;
# Update ubuntu every week on Saturday.
0 0 * * SAT sudo apt-get update && sudo apt-get upgrade -y && sudo apt-get autoremove -y && sudo reboot
# Restart Tangerine to clear in memory caches.
0 0 * * * docker stop tangerine && docker start tangerine
# Ensure tangerine and couchdb start if the machine is rebooted.
@reboot docker start couchdb && sleep 10 && docker start tangerine
```

__Step 7__: Log into Tangerine Editor

Using the credentials you set for `USER1` in your config.sh file, go to the URL of your server and log in.

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

SSH into your server and run the commands in the release.

Note that if you have created groups already and you are now updating `T_HOST_NAME` or `T_PROTOCOL` in `config.sh`, you will manually need to edit the `settings` docs in each group. See [issue #114](https://github.com/Tangerine-Community/Tangerine/issues/114) for the status of this. 

### CouchDB Upgrades
Periodically CouchDB will issue security vulnerability fixes. Subscribe to their blog to be notified of releases (<http://blog.couchdb.org>) and then run the following commands.

```bash
docker pull couchdb
cd tangerine
./start.sh
```

### Tablet Upgrades
For the app on the tablet, wether you are using the Android Installation method or the Web Browser installation method, the update process is the same. After server upgrades or content changes, return to the "Releases" tab in the online Editor and click "Test Release". When that completes, fetch your designated test tablet. Ensure you have an Internet connection on your designated test tablet, open the app, log in, and from the top right menu select "Check for Update". Follow the prompts to update. If the updates are satisfactory, return to your "Releases" tab online and click "Live Release". Proceed to update your Tablets with the "Live Release" app.

## Local Content Development
We use a tool called `tangerine-preview` to do local content development. Note this is content development via code as opposed to the Editor GUI interface. To read more about the process, see our docs site on [local content development](https://docs.tangerinecentral.org/editor/advanced-form-programming/local-content-development/).

## App Development

### Develop for Editor and Server 
Docker and git is required for local development. For Mac, download and install [Docker for Desktop](https://www.docker.com/products/docker-desktop). For Windows you will also use Docker for Desktop, but we suggest using the instructions [here](https://docs.docker.com/docker-for-windows/wsl/) which will also point you towards documentation for installing WSL2 on Windows.

```bash
git clone git@github.com:tangerine-community/tangerine
cd tangerine
cp config.defaults.sh config.sh
./develop.sh
```

Now open <http://localhost/> in your web browser. To debug the node.js server, install [NiM](https://chrome.google.com/webstore/detail/nodejs-v8-inspector-manag/gnhhdgbaldcilmgcpfddgdbkhjohddkj), open it through your devtools and connect to port 9229.

__Optional__: If you want to test deploying APKs and PWAs, you'll need to make your sandbox accessible using an https URL. A reverse proxy will forward https requests to your dev instance running on port 80. Tangerine Developers have had good luck using [tunnelto](https://tunnelto.dev/) and [ngrok](https://ngrok.com/) to create an https tunnel to your local server. Please note that using those methods expose your dev environment to the Internet. An alternative is to create your own reverse proxy - see the [Reverse Proxy for Developers](./docs/developer/reverse-proxy-for-developers.md) doc for more information. 

You must modify T_HOST_NAME and T_PROTOCOL in config.sh using the URL of your dev server. When using a service such as NGROK, it can be worth it to pay for a static domain name as you would otherwise have to keep destroying your data folder, updating config.sh with the new URL, and starting over every time you get one of the random NGROK addresses.

Example config.sh settings when using a reverse proxy:
```bash
T_HOST_NAME='123random.ngrok.io'
T_PROTOCOL="https"
```

The [Bullet points for Tangerine Development](./docs/developer/development-bullet-points.md) document has an example of how to get started with Tangerine development.

### Develop for Client (AKA Device, AKA Tablet) 

Prereqs includes [node](https://nodejs.org/en/). Before setting up your sandbox, see the decide which Content Set you would like to set it up with. Content Sets are configuration and forms for Tangerine that serve as starting places and examples of the different ways Tangerine Client can be used. See the list of Content Sets in the `content-sets` folder and note which one you will be installing with which will be referenced in the commands below.

For Tangerine instances based on a v3.x branch, you may need to install phantomjs globally in order to run tests.
```bash
cd /usr/local/share
sudo wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.8-linux-x86_64.tar.bz2
sudo tar xjf phantomjs-1.9.8-linux-x86_64.tar.bz2
sudo ln -s /usr/local/share/phantomjs-1.9.8-linux-x86_64/bin/phantomjs /usr/local/share/phantomjs
sudo ln -s /usr/local/share/phantomjs-1.9.8-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs
sudo ln -s /usr/local/share/phantomjs-1.9.8-linux-x86_64/bin/phantomjs /usr/bin/phantomjs
```

```bash
# Install Angular CLI globally. This is useful for using the `ng generate` subcommand for templating out new Components, Modules, etc.
npm install -g @angular/cli
# Clone the repository.
git clone git@github.com:tangerine-community/tangerine
# Navigate to the client codebase in the repository.
cd tangerine/client/
# Install client dependencies.
npm install
# Remove the existing Angular Assets folder as we will populate it with a Content Set.
rm -rf src/assets
# Copy the client folder of a Content Set into the Angular Assets folder.
cp -r ../content-sets/<your pick>/client src/assets
# Set up an app-config.json file. You won't have to modify anything in this file for development, it just needs to be a copy.
cp src/assets/app-config.defaults.json src/assets/app-config.json
# Copy the latest translations into the Angular Assets folder.
cp ../translations/translation* src/assets/
# Workaround for ssl issue in phantomjs: error:0308010C:digital envelope routines::unsupported
export NODE_OPTIONS=--openssl-legacy-provider
# Start the Angular development server.
npm start
```

If you are developing on an M1-based Mac, run `export NODE_OPTIONS="--openssl-legacy-provider"` in your command shell before running `npm start`.

View the app at <http://localhost:4200>.

If using ngrok.io or tunnelto.dev, use the 'start-using-proxy' instead of 'start' command. This will add some switches that enable the use of some older libraries.

## Deprecated Version of Tangerine

Some projects are still using the deprecated v2 version of Tangerine. If you need to install this version, use the `v2.2.5-couchdb-1.7.2-e` Docker image.

## Trademark and License
Tangerine Logo is a registered trademark of [RTI International](https://rti.org). This software is licensed under the [GPLv3 License](https://www.gnu.org/licenses/gpl-3.0.en.html).
