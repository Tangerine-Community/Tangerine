# Tangerine

![Tangerine](http://static1.squarespace.com/static/55c4e56fe4b0852b09fa2f29/t/55c4ec18e4b0f8bc41c735ae/1461960019800/?format=1500w)

[![Build Status](https://travis-ci.org/Tangerine-Community/Tangerine.svg)](https://travis-ci.org/Tangerine-Community/Tangerine)

[![Stories in Ready](https://badge.waffle.io/Tangerine-Community/Tangerine.png?label=ready&title=Ready)](https://waffle.io/Tangerine-Community/Tangerine)

[![Join the chat at https://gitter.im/Tangerine-Community/Tangerine](https://badges.gitter.im/Tangerine-Community/Tangerine.svg)](https://gitter.im/Tangerine-Community/Tangerine?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Digitize your EGMA and EGRA data collection with Tangerine. Create your Assessments online, conduct them offline with the Tangerine Android App. All results you collect can be exported as a spreadsheet. Tangerine has been used by over 30 organizations to conduct over 1 million assessments and surveys in over 50 countries and in 100 languages.


## Installation
We recommend using AWS for hosting have documented detailed [instructions for AWS](docs/install-on-aws.md). Below are general instructions for installing on any machine.

SSH into your machine from a terminal, [install Docker](https://docs.docker.com/engine/installation/linux/ubuntulinux/), and then run the following commands. You'll need the version of the most recent release. Find that on the releases page [here](https://github.com/Tangerine-Community/Tangerine-server/releases).
```
# Get the software.
git clone https://github.com/Tangerine-Community/Tangerine.git
cd Tangerine
git checkout <version tag>
# Create config.sh and edit to match your desired settings. Make sure to set `TANGERINE_VERSION` to the same as what `<version tag>` in the prior commands. 
cp config.defaults.sh config.sh
nano config.sh
# Start the software.
./start.sh
```

If your server restarts or the container stops, you can later run the `./start.sh` script in the Tangerine-server folder.

To use SSL, put an SSL enabled Reverse Proxy in front of Tangerine and set the `T_PROTOCOL` variable in `config.sh` to `https` before running `start.sh`. At RTI we use AWS's Elastic Load Balancer in front of Tangerine because it automatically renews and cycles SSL certificates for us. How to set this up is detailed in our [instructions for AWS](docs/install-on-aws.md).  If your Tangerine install is on a Digital Ocean Droplet, you can use their Load Balancers and configure them for SSL. See [How To Configure SSL Termination on DigitalOcean Load Balancers](https://www.digitalocean.com/community/tutorials/how-to-configure-ssl-termination-on-digitalocean-load-balancers).
Now visit your Tangerine-server installation at the IP address or hostname of your installation. In this configuration, the browser talks to the Load Balancer securely on Port 443 while the load balancer communicates with Tangerine Container on port 80 on a private network.


## Upgrade
SSH into your server and run the following commands.
```
cd Tangerine
git fetch origin
git checkout <version tag>
# Set up config.sh again.
cp config.sh config.sh_backup
cp config.defaults.sh config.sh
# Migrate settings from config backup to config.sh. Set TANGERINE_VERSION to the same <version tag>.
vim -O config.sh config.sh_backup
rm config.sh_backup
./start.sh
```

Note that if you have created groups already and you are now updating `T_HOST_NAME` or `T_PROTOCOL` in `config.sh`, you will manually need to edit the `settings` docs in each group. See [issue #114](https://github.com/Tangerine-Community/Tangerine/issues/114) for the status of this. 


## Technical Documentation
Check out the [Tangerine Technical Documentation site on Github Pages](http://tangerine-community.github.io/Tangerine/index.html). Want to contribute documentation? Fork the Tangerine repository, commit to the `gh-pages` branch and send us a pull request.

## Trademark and License
Tangerine is a registered trademark of [RTI International](https://rti.org). This software is licensed under the [GPLv3 License](https://www.gnu.org/licenses/gpl-3.0.en.html).
