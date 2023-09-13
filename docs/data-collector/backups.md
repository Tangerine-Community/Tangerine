## Backups

Data managers can take backups of the data on a device using the Export Data feature. Log in as the "admin" user on the device to export data for all users. The Export Data feature is in the dropdown menu in the top-right corner after log-in. 

The backup files will be saved in the `/storage/self/primary/Documents/Tangerine/backups/` directory on the device.


## Copy device backups to a computer

Transfering the backup requres the [Android Debug Bridge](https://developer.android.com/tools/adb) installed on the computer. Make sure to add the command `adb` to your executable PATH environment variable. 

Use the following commands to save *all* of the database backup files:

For MacOS:

```bash
adb pull /storage/self/primary/Documents/Tangerine/backups/tangerine-variables ~/Desktop/
adb pull /storage/self/primary/Documents/Tangerine/backups/tangerine-lock-boxes ~/Desktop/
adb pull /storage/self/primary/Documents/Tangerine/backups/users ~/Desktop/
adb pull /storage/self/primary/Documents/Tangerine/backups/shared-user-database ~/Desktop/
```

For Windows:

```bash
adb pull /storage/self/primary/Documents/Tangerine/backups/tangerine-variables %USERPROFILE%\Desktop\
adb pull /storage/self/primary/Documents/Tangerine/backups/tangerine-lock-boxes %USERPROFILE%\Desktop\
adb pull /storage/self/primary/Documents/Tangerine/backups/users %USERPROFILE%\Desktop\
adb pull /storage/self/primary/Documents/Tangerine/backups/shared-user-database %USERPROFILE%\Desktop\
```
 
