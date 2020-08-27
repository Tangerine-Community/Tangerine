## Tangerine Preview
Tangerine Preview is a command line tool for previewing the Tangerine content you are working on your local computer. It work on Windows, Mac, and Linux. If you are on macOS, check out this [video](https://youtu.be/WV3U7AABjXA) that demonstrates how to install and use the Tangerine Preview tool.


## Install
Before you install `tangerine-preview`, make sure to install [node.js](https://nodejs.org/en/). 

If you are on macOS, you will need to set permissions to allow for global installs by running the following command.
```
sudo chown -R `whoami` /usr/local/lib/node_modules
```

For all platforms, open a command line terminal and run Tangerine Preview install command.
```
npm install -g tangerine-preview
```

## Preview your content
Open a command prompt, change directory to your content that you would like to preview, then run the `tangerine-preview` command.

```
cd your-project
tangerine-preview
```

Lastly, open Google Chrome to http://localhost:3000

As you make content changes, they will be synced to the app. Reload your web browser and you'll see the changes.


## Update `tangerine-preview`
When new releases come out for tangerine, `tangerine-preview` will also be updated. To update, open a command prompt and run the install command again.

```
npm install -g tangerine-preview
```

## Check your currently install version

```
npm list -g tangerine-preview
```



