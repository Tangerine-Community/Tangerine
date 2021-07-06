## Tangerine Preview
Tangerine Preview is a command line tool for previewing the Tangerine content you are working on your local computer. It work on Windows, Mac, and Linux. 

Current version of Tangerine: v3.6.0

## Install
To install on macOS, you can follow the video [here](https://youtu.be/WV3U7AABjXA). 

Before you install `tangerine-preview`, make sure to install [node.js](https://nodejs.org/en/). If you are using macOS, you need to set additional permissions with the following command:

```
sudo chown -R `whoami` /usr/local/lib/node_modules
```

Install the Tangerine Preview tool by opening a command prompt and running the following command.
```
npm install -g tangerine-preview
```


## Preview your content
Open a command prompt, change directory to the `client` subfolder of the Tangerine group that you would like to preview, then run the `tangerine-preview` command.

```
cd your-project/client
tangerine-preview
```

Lastly, open Google Chrome to http://localhost:3000

As you make content changes, they will be synced to the app. Reload your web browser and you'll see the changes.


## Update `tangerine-preview`
When new releases come out for tangerine, `tangerine-preview` will also be updated. To update, open a command prompt and run the install command again.

```
npm install -g tangerine-preview
```



