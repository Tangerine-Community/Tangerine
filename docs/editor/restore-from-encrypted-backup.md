# Restoring from an Encrypted Backup

## Restoring a backed-up encrypted database onto a fresh Tangerine app installation.

This only works for sync-protocol-2. 

Connect the tablet to the pc with a USB cable. Use Android File transfer to browse to the `Download` directory. Create a new directory called `restore` inside the `Download` directory so that the following directory structure exists: `Download/restore`. Copy the database file from the pc to the `restore` directory. 

Install the Tangerine app on the tablet.  From the language dropdown screen, click a link marke `Restore database`.

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

