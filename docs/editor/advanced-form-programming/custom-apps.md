# Custom Apps


The easiest way to start with a custom app is to create a group using the custom-app content set. There is a real custom app available here: https://github.com/ICTatRTI/SE-tools

Custom apps allow you to customize the interface and tailer it to your needs. You can use a custom app to control not only the visual aspect of your app, but also which forms are shown to the user and when. This can be done with logic conditions in your custom app


## Create a group with pre-build custom app

```
docker exec -it tangerine create-group "My custom app" custom-app
```

You can also clone directly suing the git repository for Self-Administered EGRA and EGMA

```
docker exec -it tangerine create-group "My custom app" https://github.com/ICTatRTI/SE-tools.git
```

## Creating a Custom App

To develop your own custom app, you can use the prebuild custom-app content set which provides scaffolding for your new app.

```
cd tangerine/content-sets
cp -r custom-app my-app
cp ../translations/* my-app/client/
cd my-app
git init
git add .
git commit -m "First."
git branch -M main
git remote add origin <your apps origin> 
git push -u origin main
npm install
npm start
```

## Custom app Examples

Tangerine for evaluations using sign language.

<img src="../../assets/customApp2.png" width="570">

Tangerine Self-Administered EGMA

<img src="../../assets/customApp1.png" width="570">

Custom app with revamped form listing. 

<img src="../../assets/customApp3.png" width="570">

