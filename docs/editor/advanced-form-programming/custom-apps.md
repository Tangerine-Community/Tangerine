# Custom Apps

## Creating a Custom App

The easiest way to start with a custom app is to create a group using the custom-app content set. There is a real custom app avaialbe here: https://github.com/ICTatRTI/SE-tools

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
