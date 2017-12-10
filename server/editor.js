var fs = require('fs-extra')
var read = require('read-yaml')
var config = read.sync('./config.yml')

let Editor = function Editor() {

  this.listProjects = function() {
    return new Promise(async (resolve, reject) => {
      console.log('listing projects.')
      fs.readJson(config.contentRoot + '/forms.json').catch(err => {
        console.error(err) // Not called
      })
        .then(contents => {
          resolve(contents)
          return contents
        })
        .catch(error => {
          console.log('bummer: ' + error)
          reject(contents)
        });
    });
  }
  return this;
}

module.exports = Editor;

