## Server upgrade instructions

Reminder: Consider using the [Tangerine Upgrade Checklist](https://docs.tangerinecentral.org/system-administrator/upgrade-checklist.html) for making sure you test the upgrade safely.

__Preparation__

Tangerine v3 images are relatively large, around 12GB. The server should have at least 20GB of free space plus the size of the data folder. Check the disk space before upgrading the the new version using the following steps:

```bash
cd tangerine
# Check the size of the data folder.
du -sh data
# Check disk for free space.
df -h
```

If there is **less than** 20 GB plus the size of the data folder, create more space before proceeding. Good candidates to remove are: older versions of the Tangerine image and data backups.
```bash
# List all docker images.
docker image ls
# Remove the image of the version that is not being used.
docker rmi tangerine/tangerine:<unused_version>
# List all data backups.
ls -l data-backup-*
# Remove the data backups that are old and unneeded.
rm -rf ../data-backup-<date>
```

__Upgrade__

After ensuring there is enough disk space, follow the steps below to upgrade the server.

1. Backup the data folder
```bash
# Create a backup of the data folder.
cp -r data ../data-backup-$(date "+%F-%T")
```

2. Confirm there is no active synching from client devices

Check logs for the past hour on the server to ensure it's not being actively used. Look for log messages like "Created sync session" for Devices that are syncing and "login success" for users logging in on the server.

```bash
docker logs --since=60m tangerine
```

3. Install the new version of Tangerine
```bash
# Fetch the updates.
git fetch origin
# Checkout a new branch with the new version tag.
git checkout -b <new_version> <new_version>
# Run the start script with the new version.
./start.sh <new_version>
```

__Clean Up__

After the upgrade, remove the previous version of the Tangerine image to free up disk space.

```bash
docker rmi tangerine/tangerine:<previous_version>
```