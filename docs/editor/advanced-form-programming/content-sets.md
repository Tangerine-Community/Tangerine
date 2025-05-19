## Content Sets 

Content Sets are groups of forms and configuration you can use as a template for new group creation. Tangerine already comes with some predefined content sets:

- custom-app - is a custom app group starter set
- default - is the regular Tangerine group
- teach and attendance - are two versions of a teach set that has been preconfigured.
- case module and case-module-starter - are two sets that showcase the case module

  

## Anatomy of a Content Set

### Version 1 (< Tangerine v3.13.0)
In the root directory of a v1 Content Set, you will find the following:
- `./app-config.json_example` (required)
- `./forms.json` (required)

### Version 2 (> Tangerine v3.13.0)
Starting in Tangerine v3.13.0, the second iteration of Content Sets was launched. In the root directory of a v2 Content Set, you will find the following:

- `./client/` (required): The folder containing content that will be deployed to Tablets.
- `./client/app-config.defaults.json` (required): Defaults to use for `app-config.json`. For example, a Case Module enabled group would have a `"homeUrl"` property with a value of `"case-home"`.
- `./client/forms.json` (required)
- `./editor/` (required): A folder containing assets pertanent to how Editor behaves.
- `./editor/index.html` (required): The file loaded when displaying the Dashboard in a group's Editor.
- `./README.md` (suggested)
- `./docs/` (suggested)

### Version 2.1 (>= Tangerine 3.15.0)
Starting in Tangerine v3.13.0, content sets gained a package.json and build step. The package.json specifies the required libs and scripts for the content set. If the content set uses custom scripts, these scripts are compiled by the included webpack. Note that .gitignore ignores the compiled code - client/custom-scripts.js - to avoid conflicts.

To install the 2.1 content set - instead of npm install, run `npm run install-server`.

Be sure to update any cron jobs to include the new build commands if they are using content set 2.1:

``
git pull
npm run install-server
npm build
``

If using Content set 2, this build process is not necessary. However, it is an advantage for cs2 users to upgrade to be able to pin the webpack version in packagejson and also to not have the huge custom-scripts file.

## Creating a new Content Set

Create a new content set by copying a group's content into the content-sets folder. You have to update the app-config.json file and rename it to app-config-default.json. In this file, if using sync1, you must update the `uploadToken` and put the correct `homeUrl` for your app. Copy this folder under the content-sets folder

## Enable content set dropdown in new group creation

You can configure a drop down during group creation to allow you to select a pre-configured content set with it's forms. To do this rename the file `content-sets-example.json` to `content-sets.json` then open the file and adjust the id and labels. The id must correspond to your content-set folder name. In the example below I have enabled the default (regular group) and the teach content-sets

```
[
    {
        "id": "default",
        "label": "Default content set"
    },
    {
        "id": "teach",
        "label": "Teach"
    }
]
```

This will result in having a drop down in the group creation

!!! warning
    Having this configuration means that only the user1 account should create new groups. For regular Tangerine groups, make sure that the uploadToken in the app-config-default.json file for the content set is correctly set. 


<img src="../../assets/groupDropdown.png" width="300">

## Importing a Content Set into Tangerine

New group set:
- git clone tangerine starter repo
- Modify content as needed
- Push to Git
- On server instance, setup GH deploy key by navigating to your Repository on Github and click on `Settings -> Deploy keys -> Add deploy key` and paste your Docker instances /root/.ssh/id_rsa.pub in the key contents, enable "Allow write access" and save.
Run `docker exec tangerine create-group "New Group A" https://github.com/id/tangerine-content.git` using the cli
- Add crontab entry that uses the non-pub key to do the pull, npm run install-server, npm run build.

