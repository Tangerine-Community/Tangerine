const fs = require("fs");
const path = require("path");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// From https://gist.github.com/kethinov/6658166#gistcomment-1941504
const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));

  });
	return filelist;
}

const filePaths = walkSync('../content')
const htmlFilePaths = filePaths.filter(file => file.indexOf('.html') !== -1)

htmlFilePaths.forEach(htmlFilePath => {
  let fileContents = fs.readFileSync(htmlFilePath, 'utf8')
	const dom = new JSDOM(`
		<!DOCTYPE html>
		<html>
			<body>
				${fileContents}
			</body>
		</html>
	`)
  let tangyTimedEls = dom.window.document.body.querySelectorAll('tangy-timed')
  if (tangyTimedEls.length == 0) return
  tangyTimedEls.forEach(tangyTimedEl => {
    // Get all input elements.
    let inputEls = tangyTimedEl.querySelectorAll('input')
    // Transform each input element into an option element.
    let optionEls = []
    inputEls.forEach(inputEl => {
      let optionEl = dom.window.document.createElement('option')
      optionEl.innerHTML = inputEl.getAttribute('placeholder')
      optionEl.setAttribute('value', inputEl.getAttribute('name'))
      optionEls.push(optionEl)
    })
    // Replace input elements with option elements. 
    tangyTimedEl.innerHTML = ''
    optionEls.forEach(optionEl => tangyTimedEl.appendChild(optionEl))
  })
  fs.writeFileSync(htmlFilePath, dom.window.document.body.innerHTML, 'utf8')
})



