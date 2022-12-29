# Custom Apps

## Creating a Custom App

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
