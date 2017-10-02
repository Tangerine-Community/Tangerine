# Tangerine Client v3

## Installation
Prerequisites:
- Install Node 8 (https://nodejs.org)
- Install command line utilities with `npm install -g angular-pages gh-markdown-cli @angular/cli http-server`

Use the following commands to install, build and run. 
```
git clone https://github.com/tangerine-community/tangerine.git
cd tangerine
git checkout v3.x.x
cd client-v3
npm install
npm run build
cd dist
http-server
```

Then in a web browser go to http://127.0.0.1:8080/.

## Live edit pages
To get started seeing your live changes, in a terminal open the `tangerine/client-v3` and run run `npm start`. Now go to http://localhost:4200/ in your web browser.

To edit pages, open the `tangerine/client-v3/pages` directory in a code editor. If you don't have one, Atom is a great choice https://atom.io/. After you make a change to the pages, run `npm run build` again from the `tangerine/client-v3` directory. To make a link to a page you create, create an anchor tag with a `routerLink` property set to the path of your page. For example, if you had a Markdown page at `./pages/some-path/hello-world.md`, you would create an anchor tag like `<a routerLink="/some-path/hello-world">Link to my hello world</a>`. Note how the path does not have the `.md` file extension of the page you are linking to. 

Inside of you pages files you can now write any mix of Markdown syntax and HTML fill out the content of your page. For a reference of Markdown syntax, see the [cheatsheet here](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet). Note that if you want to create Tangerine Forms on your pages, you will not be able to use Markdown syntax or use the `.md` extension on those pages, you will use the `.html` file extension. This is a bug we're hoping to fix soon.

