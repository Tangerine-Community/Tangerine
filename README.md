# Tangerine

![Tangerine](http://static1.squarespace.com/static/55c4e56fe4b0852b09fa2f29/t/55c4ec18e4b0f8bc41c735ae/1461960019800/?format=1500w)

[![Build Status](https://travis-ci.org/Tangerine-Community/Tangerine.svg)](https://travis-ci.org/Tangerine-Community/Tangerine)

[![Stories in Ready](https://badge.waffle.io/Tangerine-Community/Tangerine.png?label=ready&title=Ready)](https://waffle.io/Tangerine-Community/Tangerine)

[![Join the chat at https://gitter.im/Tangerine-Community/Tangerine](https://badges.gitter.im/Tangerine-Community/Tangerine.svg)](https://gitter.im/Tangerine-Community/Tangerine?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Digitize your EGMA and EGRA data collection with Tangerine. Create your Assessments online, conduct them offline with the Tangerine Android App. All results you collect can be exported as a spreadsheet. Tangerine has been used by over 30 organizations to conduct over 1 million assessments and surveys in over 50 countries and in 100 languages.


## Installation

See [installation demonstration video](https://vimeo.com/171423878).

The easiest way to get started is to create an Ubuntu 14.04 Droplet on [Digital Ocean](https://digitalocean.com). 

We also have [instructions for AWS](docs/INSTALLATION_AWS.md) which include the following steps.

SSH into it from a terminal, [install Docker](https://docs.docker.com/engine/installation/linux/ubuntulinux/), and then run the following commands. You'll need the URL of the most recent release. Find that on the releases page [here](https://github.com/Tangerine-Community/Tangerine-server/releases).
```
wget <latest release, choose tar.gz option>
tar xvf <the tarball>
cd <the now uncompressed tangerine folder>
cp config.defaults.sh config.sh
# Edit the config.sh file to match your desired settings. Try `nano config.sh`. 
# You must edit all of the variables in the "Required to change" section. 
./start.sh
```

Now visit your Tangerine-server installation at the IP address or hostname of your installation.

If your server restarts or the container stops, you can later run the `./start.sh` script in the Tangerine-server folder. To upgrade your server, run the `./upgrade.sh` script. Note that if you update environment variables in `config.sh`, they will not be propogated to the `settings` doc in each group so certain paths will break. See [issue #114](https://github.com/Tangerine-Community/Tangerine/issues/114) for the status of this. 

To use SSL, put an SSL enabled Reverse Proxy in front of Tangerine and set the `T_PROTOCOL` variable in `config.sh` to `https`. At RTI we use AWS's Elastic Load Balancer in front of Tangerine because it automatically renews and cycles SSL certificates for us. If your Tangerine install is on a Digital Ocean Droplet, you can use their Load Balancers and configure them for SSL. See [How To Configure SSL Termination on DigitalOcean Load Balancers](https://www.digitalocean.com/community/tutorials/how-to-configure-ssl-termination-on-digitalocean-load-balancers).

## Technical Documentation
Check out the [Tangerine Technical Documentation site on Github Pages](http://tangerine-community.github.io/Tangerine/index.html). Want to contribute documentation? Fork the Tangerine repository, commit to the `gh-pages` branch and send us a pull request.

## Trademark and License
Tangerine is a registered trademark of [RTI International](https://rti.org). This software is licensed under the [GPLv3 License](https://www.gnu.org/licenses/gpl-3.0.en.html).
