(doc, req) ->
  log(req);
  return {
    "headers" :
      "Content-Type" : "text/csv"
      "Content-Disposition" : "attachment; filename=\"#{req.query.filename}.csv\""
      "Pragma"  : "no-cache"
      "Expires" : "0"
    "body" : doc.csv
  }