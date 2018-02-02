# Tangerine Client
This folder contains all of the pieces of software used to build a tangerine client used for collecting data on Tablets or laptops.

To develop, run `./install.sh` and then `./develop.sh`. 

To test a build you can `./build.sh && cd build && http-server`.

To view your app within the Tangerine login shell, visit http://localhost:4200/#/tangy-forms

To view your app without the shell (much easier), visit http://localhost:4200/tangy-forms/index.html

# Troubleshooting

If you have any port conflicts, modify the ports in the following files:

* client/develop.sh
* client/shell/proxy.conf.json

