## Local content development with Tangerine Preview
Tangerine Preview is a command line tool for previewing the Tangerine content you are working on your local computer. It work on Windows, Mac, and Linux. 

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

## Set up VS Code with Syntax Highlighting for `on-open`, `on-change`, etc.
Ideally we would have a VS Code plugin for you to install. Until then, this is our workaround. If you are interested in helping with the development of a VS Code plugin, feel free to reach out to us via the issue queue.

### Step 1 
Open Visual Studio configuration file. If you have the VS Code CLI installed, run the following in a terminal.
```
code /Applications/Visual\ Studio\ Code.app/Contents/Resources/app/extensions/html/syntaxes/html.tmLanguage.json
```

### Step 2
Find `on(s(c` and replace with `on-open|on-change|on-submit|skip-if|hide-if|dont-skip-if|disable-if|valid-if|discrepancy-if|warn-if|on(s(c`.

<img width="1363" alt="Screen Shot 2020-02-13 at 11 58 59 AM" src="https://user-images.githubusercontent.com/156575/74458893-606bfd80-4e58-11ea-986b-84b2d4c0c43b.png">

### Step 3
Restart Visual Studio.
