(head, req) ->

  start
    "headers" : {
      "Content-Type": "text/csv; charset=UTF-8"
      "Content-Disposition": 
        if req.query.download == "false"
          ""
        else
          "attachment; filename=\"#{req.query.filename}.csv\""
    }

  `unpair = function(pair) { for (var key in pair) {return [key, pair[key]] }} `

  excludes = if req.query.excludes? then JSON.parse(req.query.excludes) else []
  includes = if req.query.includes? then JSON.parse(req.query.includes) else []

  dump = (obj) ->
    out = ""
    for i in obj
        out += i + ": " + obj[i] + "\n"

  rowCache = []

  columnsBySubtest = {}

  #
  # same results to create column headings
  #
  

  #
  # Create column headings
  #

  toSample = 50
  while true

    row = getRow()
    break if not row?

    rowCache.push row

    for subtest in row.value
      for subtestIndex, subtestValue of subtest
        columnsBySubtest[subtestIndex] = [] if not columnsBySubtest[subtestIndex]?
        for pair in subtestValue
          key = unpair(pair)[0] || ''
          isExcluded = false
          isIncluded = false

          for exclude in excludes

            if exclude.match(/[^\w]/)
              isExcluded = true if key.match( new RegExp(exclude.replace(/\//g,""), "g") )
            else
              isExcluded = true if key == exclude


          for include in includes

            if include.match(/[^\w]/)
              isIncluded = true if key.match( new RegExp(include.replace(/\//g,""), "g") )
            else
              isIncluded = true if key == include

          if !~columnsBySubtest[subtestIndex].indexOf(key) && ( not isExcluded or isIncluded )
            columnsBySubtest[subtestIndex].push key

    break if toSample-- == 0

  #
  # Flatten and send column headings
  #

  columnNames = []
  columnKeys  = []
  for subtestKey, subtest of columnsBySubtest
    for key in subtest
      columnKeys.push key
      columnNames.push "\"" + key + "\""
  send columnNames.join(",") + "\n"


  row = true

  #limit = 50

  while true

    #break if limit-- == 0

    if rowCache.length != 0
      row = rowCache.shift()
    else
      row = getRow()

    break unless row?

    # flatten
    oneRow = {}
    for oneSubtest in row.value
      for subtestIndex, subtest of oneSubtest
        for pair in subtest
          undone = unpair(pair)
          continue unless undone?
          key   = undone[0]
          value = undone[1]
          
          oneRow[key] = value

    # send one csv row
    csvRow = []
    for columnKey in columnKeys
      rawCell = oneRow[columnKey]
      if rawCell?
        csvRow.push  '"' + String(rawCell).replace(/"/g,'”') + '"'
      else

        csvRow.push null
    send csvRow.join(",") + "\n"

  return
