# Case Module Starter Content Set

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

## Preview
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
