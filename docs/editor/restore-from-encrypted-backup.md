# Restoring from an Encrypted Backup

## Android app

TBD

## Viewing data from an encrypted backup

Ask user to go to Export Data and press "Export Data for all Users". The file will be saved in the `Android/data/org.rti.tangerine/files` directory. Transfer the file. Then ask the user to go to the About menu and read off the Device ID. 

In Fauxton, look up the device record in the group-uuid-devices database. Copy the value for the `key` property.

Building SqlCipher on MacOSX:

```shell script
git clone https://github.com/sqlcipher/sqlcipher.git
cd sqlcipher/sqlcipher
./configure --enable-tempstore=yes CFLAGS="-DSQLITE_HAS_CODEC -I/usr/local/opt/openssl/include/" LDFLAGS="/usr/local/opt/openssl/lib/libcrypto.a"
```

To use the compiled sqlcipher:

```shell script
sqlcipher/sqlcipher ~/Downloads/shared-user-database
```
In the sqlcipher console, enter the key:

```sql
PRAGMA key = '673939d9-1fae-457e-8eea-7e8cd1de08a5';
```

To list tables:

```sql
.tables
```
Output: 
```shell script
attach-seq-store  by-sequence       local-store
attach-store      document-store    metadata-store
```

