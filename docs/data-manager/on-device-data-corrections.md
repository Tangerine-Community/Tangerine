# On Device Data Corrections using Issues

Enable "Allow Creation of Issues" in your App Config for Devices and Data Collectors will be able to propose changes to data that has already been submitted. After the Data Collector syncs, Data Managers may view those proposals in the Issues UI in their corresponding group, then comment or choose to merge the issue. Note that Data Collectors on Devices are not shown the "Merge" button on Issues, thus is up to the Data Manager to review and merge any proposals for data corrections in Issues.

- [Video Demo of configuration and usage](https://youtu.be/xWXKubQNLog)

![New Issue on Device Button](./new-issue-on-device-button.png)

## Configuration
- To enable Devices to create Issues, add `"allowCreationOfIssues": true` to the group's `client/app-config.json` and release to Devices.
- To template out the resulting Issue title and descriptions, add `templateIssueTitle` and `templateIssueDescription` to Case Definitions.

