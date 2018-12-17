const fs = require('fs')
const groupsList = _ => {
  return new Promise((resolve, reject) => {
    fs.readdir('/tangerine/client/content/groups', (err, items) => {
      if (err) reject(err)
      resolve(items.filter(item => item.substr(0, 1) !== '.' && item !== 'README.md'))
    })
  })
}
module.exports = groupsList