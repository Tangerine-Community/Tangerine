# Reverse Proxy for Developers

## Reverse proxy software

[local-ssl-proxy](https://github.com/cameronhunter/local-ssl-proxy) is a Node.js app that can be used to proxy requests from a local development server to a remote server over HTTPS. This is an alternative to using a reverse proxy tunnel service such as ngrok.io or tunnelto.dev.

## Generate SSL certificates

Here's a nice primer on creating a self-signed SSL certificate: https://deliciousbrains.com/ssl-certificate-authority-for-local-https-development/ I've lifted these examples from that article. Although this example focuses on MacOS, the primer in the link has examples for Linux and Windows. 

In the following example, the code creates a key and cert for a local dev server named tangy.test. Note that this script does not have the `-des3` switch, which forces the use of a password, because the script is intended for use with local development servers.

`openssl genrsa -out tangy.test.key 2048`

You'll answer a bunch of questions. The most important one is the Common Name (e.g. server FQDN or YOUR name). Enter the name of your local dev server here, e.g. tangy.test.

`openssl req -new -key tangy.test.key -out tangy.test.csr`

You should now have two files: myCA.key (your private key) and myCA.pem (your root certificate).

# Adding the Root Certificate to macOS Keychain

`sudo security add-trusted-cert -d -r trustRoot -k "/Library/Keychains/System.keychain" myCA.pem`

The tutorial has examples of adding the root certs to other devices, which might be handy for Android and IOS development.

# Creating CA-Signed Certificates

Now create tangy.test.ext:

```
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = tangy.test
```

The final step: 

`openssl x509 -req -in tangy.test.csr -CA myCA.pem -CAkey myCA.key \
-CAcreateserial -out tangy.test.crt -days 825 -sha256 -extfile tangy.test.ext`

We now have three files: tangy.test.key (the private key), tangy.test.csr (the certificate signing request, or csr file),
and tangy.test.crt (the signed certificate).
We can configure local web servers to use HTTPS with the private key and the signed certificate.

# Using local-ssl-proxy

At this point you can launch Tangerine, which will respond to requests on port 80. Then launch local-ssl-proxy:

local-ssl-proxy --source 443 --target 80 --cert ~/ssl/server.crt --key ~/ssl/server.key

You should be able to access Tangerine via `https://localhost`. Next step - configure your local dev domain in DNS:

## DNS settings

Add your local dev domain to /etc/hosts. The domain 'tangy.test' is used in this example; replace with your own domain:

```
##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting.  Do not change this entry.
##
127.0.0.1       localhost
255.255.255.255 broadcasthost
::1             localhost
127.0.0.1       tangy.test

```

Now you should be able to access Tangerine using https://tangy.test`.

There is a shell script in the root of this repo - local-ssl-proxy.sh - that will launch the local-ssl-proxy command with the switches mentioned earlier in this document.
