(doc, req) ->
  return {
    "headers" :
      "Content-Type" : "application/json"
      "Cache-Control": "max-age=1000"
    "body" : JSON.stringify(doc[req.query.key])
  }