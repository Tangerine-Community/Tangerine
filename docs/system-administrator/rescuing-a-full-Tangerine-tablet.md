# Rescuing a Full Tangerine Tablet

If you have a tablet that is no longer able to sync because the disk is full, you can pull files off it and install on a clean tablet. 

This is relevant only to tablets that are runing sqlite/sqlCypher.

## Listing files in private database dir

Android databases are stored in a defined location. You may list them using the `adb shell` command. 

```shell
adb shell "run-as org.rti.tangerine ls -lsa -R /data/data/org.rti.tangerine/databases/"
```

If the package name of your Tangerine differs, substitute 'org.rti.tangerine' with your package name.

This command should return something like the following:
```shell
4 -rw-------  1 u0_a647 u0_a647       0 2021-11-04 08:15 shared-user-database
4 -rw-------  1 u0_a647 u0_a647       0 2021-11-04 08:15 shared-user-database-index
500 -rw-------  1 u0_a647 u0_a647  507904 2021-11-04 08:08 shared-user-database-mrview-058020864d38b2f7c7203401485e2f6d
3180 -rw-------  1 u0_a647 u0_a647 3248128 2021-11-04 08:10 shared-user-database-mrview-0b8e5d92430db6d71d1379d7c9862b79
500 -rw-------  1 u0_a647 u0_a647  507904 2021-11-04 08:06 shared-user-database-mrview-0c1a03125cc747770c5ae321753f4ec2
3156 -rw-------  1 u0_a647 u0_a647 3223552 2021-11-04 08:10 shared-user-database-mrview-34a25e481c98744e67427811b36567c4
2900 -rw-------  1 u0_a647 u0_a647 2961408 2021-11-04 08:13 shared-user-database-mrview-3d495638a28b32b444ca7a9452a9ec5e
2924 -rw-------  1 u0_a647 u0_a647 2985984 2021-11-04 08:12 shared-user-database-mrview-918a54f957639ea4a8d24e16c6d93f50
500 -rw-------  1 u0_a647 u0_a647  507904 2021-11-04 08:12 shared-user-database-mrview-a3b8826be74302784a7af55681039cac
744 -rw-------  1 u0_a647 u0_a647  757760 2021-11-04 08:08 shared-user-database-mrview-d121af6c2693286feb260c1843a65996
1344 -rw-------  1 u0_a647 u0_a647 1372160 2021-11-04 08:09 shared-user-database-mrview-e0db7a0ed91857c44dd6ad77ee5b37f4
2588 -rw-------  1 u0_a647 u0_a647 2641920 2021-11-04 08:07 shared-user-database-mrview-e4d1230d206245fc83e75ee420b1f31e
500 -rw-------  1 u0_a647 u0_a647  507904 2021-11-04 08:11 shared-user-database-mrview-fc95555b88f96506de12d279698695f2
72 -rw-------  1 u0_a647 u0_a647   69632 2021-11-04 08:04 tangerine-variables
```

In this example, the tablet was running with the "encryptionPlugin":"CryptoPouch" configuration in app-config.json. That switch configures the app to use CryptoPouch, which encrypts documents in the app's indexedb for storage and stores indexes using sqlCypher. This is why the shared-user-database is 0 but the indexes - such as shared-user-database-mrview-fc95555b88f96506de12d279698695f2 - are large. 

## Pulling the files

Once you list the files, you much change permissions on them and then pull them. Change the permissions (chmod 666) for each file you wish to transfer:

```shell
adb shell "run-as org.rti.tangerine chmod 666 /data/data/org.rti.tangerine/databases/shared-user-database-mrview-e4d1230d206245fc83e75ee420b1f31e"
```

Once the permissions is changed, you may transfer the files:

```shell
adb exec-out run-as org.rti.tangerine cat databases/shared-user-database-mrview-e4d1230d206245fc83e75ee420b1f31e > shared-user-database-mrview-e4d1230d206245fc83e75ee420b1f31e
```

After the files are transferred, you may reset the permissions:

```shell
adb shell "run-as org.rti.tangerine chmod 600 /data/data/org.rti.tangerine/databases/shared-user-database-mrview-e4d1230d206245fc83e75ee420b1f31e"
```

## Restoring a database

In the [docs/system-administrator/restore-from-backup.md](https://github.com/Tangerine-Community/Tangerine/blob/master/docs/system-administrator/restore-from-backup.md#restoring-backups-onto-a-fresh-tangerine-app-installation), there are instructions in the section "Restoring backups onto a fresh Tangerine app installation" on how to restore a database. Those instructions show how to use Android File Transfer to move the database files to the clean Android device and restore the app using a fresh Tangerine installation.

## Database file analysis

In the [docs/system-administrator/restore-from-backup.md](https://github.com/Tangerine-Community/Tangerine/blob/master/docs/system-administrator/restore-from-backup.md#viewing-data-from-an-encrypted-backup), there are instructions in the section "Viewing data from an encrypted backup" that show how to compile and use sqlcipher to view and fix a corrupt SqlCypher database.
