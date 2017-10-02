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

  get({
    url: options.url + "/_design/ojai/_view/byDKey?keys=" + JSON.stringify([options.id.substr(options.id.length-5, 5)])
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
      return callback(null, JSON.stringify(data, null, 2))
    })
  })

}
