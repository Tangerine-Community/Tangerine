Tangerine.ReportWarnings =

  KlassToDateView : (rawData) ->
    result = []
    for bucketKey, percentages of rawData.percentages
      html = ""
      if @nUnderX 0.2, 0.75, percentages
        html += "<p>More than 20% of students got less than 75% on the #{bucketKey} assessment. Re-teach the #{bucketKey} component of the lesson during the next lesson.</p>"
      result.push
        "html" : html
    return result

  StudentToDateView : (rawData) ->
    result = []
    for bucketKey, percentage of rawData.percentages
      html = ""
      if (_.flatten(percentage)/100) < .75
        html += "<p>#{rawData.studentName} got less than 75% on the #{bucketKey} assessment. Re-teach the #{bucketKey} component from applicable lessons during the next lesson.</p>"
      result.push
        "html" : html
    return result

  nUnderX : (n, x, percentages) ->
    underCount = 0
    totalCount = 0
    for percentage in percentages
      totalCount++
      underCount++ if percentage / 100 < x
    return (underCount / totalCount) > n
    