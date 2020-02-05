# Docker Network Issues

## Overview

If you develop behind a corporate firewall, you may run into issues when building Tangerine from the Dockerfile relating to network access to file resources. Why would this happen?
- Your corporate network may use the same ports as the virtual private network that docker creates. 
- Your local DNS may may configured to use an internal corporate DNS which causes resolution problems when offline. 

If you experience these problems, add the following switches to your docker config file:

```json
"default-address-pools": [
        {
            "base": "172.80.0.0/16",
            "size": 24
        },
        {
            "base": "172.90.0.0/16",
            "size": 24
        }
    ],
  "dns": [
    "75.75.75.75",
    "8.8.8.8"
  ]
```

## Background

### Networking

Error:

```
bower polymer#^2.0.0                       ECMDERR Failed to execute "git ls-remote --tags --heads https://github.com/Polymer/polymer.git", exit code of #128 fatal: unable to access 'https://github.com/Polymer/polymer.git/': gnutls_handshake() failed: The TLS connection was non-properly terminated.

Additional error details:
fatal: unable to access 'https://github.com/Polymer/polymer.git/': gnutls_handshake() failed: The TLS connection was non-properly terminated.
 
```

Quoting correspondence with a colleague:

"Docker creates bridge networks on the set of ranges 172.[17-31].0.0/16 (and some others) by default.  If a server had a Docker network on 172.19.0.0/16, it could receive traffic from the VPN, but it would send its response to the bridge network, where it wouldn’t go anywhere."

Fortunately, we can change the default address pools for Docker networks by changing the configuration for the Docker daemon: https://github.com/moby/moby/pull/36396
 
I’m setting ours to the default address example in that pull request:"

```json
    "default-address-pools": [
        {
            "base": "172.80.0.0/16",
            "size": 24
        },
        {
            "base": "172.90.0.0/16",
            "size": 24
        }
    ]
``` 

### DNS

Error:
 
```
request to https://registry.npmjs.org/@vaadin/vaadin-usage-statistics/-/vaadin-usage-statistics-2.1.0.tgz failed, reason: getaddrinfo EAI_AGAIN registry.npmjs.org registry.npmjs.org:443
```
 
I think this is where I found this solution:
 
https://github.com/npm/npm/issues/16661
 
So, I needed to configure the docker DNS config. The first item is my local ISP (Comcast_ DNS server, the second is Google’s.)
 
  "dns": [
    "75.75.75.75",
    "8.8.8.8"
  ]
 
Change them to your needs. 

 
 
Anyway, the good news is that with both the default-address-pools and dns properties in my docker config, my build works both connected and disconnected to the RTI VPN.
