var unirest = require('unirest')

// @todo Error handling. Error param never used when using callback.

module.exports = function(options, callback) {

  // helper method for json post requests
  // needs opts.data and opts.url.
  // Chain handlers to .end(f)
  function post(opts) {
    var data = opts.data || {};
    return unirest.post(opts.url)
      .header('Accept', 'application/json')
      .header('Content-Type', 'application/json')
      .send(data);
  }

  // helper method for json get requests
  // needs opts.url.
  // Chain handlers to .end(f)
  function get(opts) {
    var data = opts.data || {};
    return unirest.get(opts.url)
      .header('Accept', 'application/json')
      .header('Content-Type', 'application/json');
  }
  
  // If an ID for an Assessment is not define, get all of the Assessments.
  if (options.id == undefined) {
    var viewUrl = options.url + "/_design/ojai/_view/byDKey"
  }
  else {
    // The byDKey View refers to keys by their last 5 characters instead of by their ID. I think that is true even when
    // other Docs are referencing Assessment Docs.
    var viewUrl = options.url + "/_design/ojai/_view/byDKey?keys=" + JSON.stringify([options.id.substr(options.id.length-5, 5)])
  }

  get({
    url: viewUrl 
  })
  .end(function(res) {
    var id_list = res.body.rows.map(function(row) {
      return row.id;
    })
    post({
      url: options.url + "/_all_docs?include_docs=true",
      data: {keys: id_list}
    })
    .end(function(res) {
      var data = []
      res.body.rows.forEach(function(row) {
        data.push(row.doc)
      })
      return callback(null, data)
    })
  })

}
