# Case Module Starter Content Set

This is a content set that includes the minimum content and configuration for starting a Case module based Content Set for Tangerine. This Content Set includes the following:

1. Minimal content with just one example Case Definition, one Event Definition, and one Event Form Definition.
2. A README.md that describes how to create your own content from this content set, how to install your content set on a Tangerine server, and how to run preview locally.
3. A Github [Issue template](https://github.com/Tangerine-Community/Tangerine/blob/master/content-sets/case-module-starter/.github/ISSUE_TEMPLATE) and [Pull Request template](https://github.com/Tangerine-Community/Tangerine/blob/master/content-sets/case-module-starter/.github/PULL_REQUEST_TEMPLATE.md). 

## Create your own content set
To start a content set, create repository on Github and then run the following commands replacing `<your repository name>` and `<your git repository's SSH url>`.

```
git clone git@github.com:tangerine-community/tangerine
cp -r tangerine/content-sets/case-module-minimal <your repository name>
cd <your repository name>
git init
git add .
git commit -m "First commit"
git remote add origin <your git repository's SSH url>
git push origin master
```


## Deploy to Tangerine
To install your content set on a group in Tangerine, we use the `create-group` command and specify your repository's SSH URL. Before you can run this command though, your Tangerine installation needs access to the repository on github. 

Grant Tangerine access to your repository by copying Tangerine's Public SSH key to your Github repository's Deploy Keys under Setting on Github.
```
# Change directories on your server to your tangerine installation.
cd tangerine
# Print the public key to the screen and copy it for pasting into the Deploy Keys settings on your Github Repository.
cat data/id_rsa.pub
```

Now you are ready to create a new Tangerine Group based on the Github repository.
```
docker exec create-group "My Group" <your git repository's SSH url>
```

To keep the repository on your server and on Github in sync, run the `crontab -e` command and add the following entry replacing `<path to tangerine>` with the path to the tangerine folder on your server.

```
* * * * * cd <path to tangerine>/data/groups/<group id> && GIT_SSH_COMMAND='ssh -i /<path to tangerine>/data/id_rsa' git pull origin master && git add . && git commit -m 'auto-commit' && GIT_SSH_COMMAND='ssh -i /<path to tangerine>/data/id_rsa' git push origin master
```

## Run preview on your local computer
To install the preview tools on your local computer, run the following commands.

```
git clone <your git repository's SSH url>
cd <your repository name>
npm install
```
To start the preview tools on your local computer, run the following command given your platform then open http://localhost/ in your web browser. 

On Windows:
```
cd <your repository name>
npm run start-windows
```

On Mac:
```
cd <your repository name>
npm run start
```

Note that it helps to have a Chrome Profile per project that you work on so that they don't end up sharing memory. For example, a Chrome profile for this project could be called `my-content-set` named after the repository.
