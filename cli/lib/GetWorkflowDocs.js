var unirest = require('unirest')
var getAssessmentDocs = require('./GetAssessmentDocs')

// @todo Error handling. Error param never used when using callback.

module.exports = function(options, callback) {

  function get(opts) {
    var data = opts.data || {};
    return unirest.get(opts.url)
      .header('Accept', 'application/json')
      .header('Content-Type', 'application/json');
  }
  

  var docsToReturn = []

  get({
    url: options.url + '/' + options.id 
  })
  .end(function(res) {
    var workflowDoc = res.body
    docsToReturn.push(workflowDoc)
    var getAssessmentDocsDoneCounter = 0
    var getAssessmentDocsDone = function(err, docs) {
      getAssessmentDocsDoneCounter++
      docs.forEach(function(doc) { docsToReturn.push(doc) })
      if (getAssessmentDocsDoneCounter == workflowDoc.children.length) return callback(null, docsToReturn)
    }
    workflowDoc.children.forEach(function(child) {
      getAssessmentDocs({url: options.url, id: child.typesId}, getAssessmentDocsDone)
    })
  })
}
