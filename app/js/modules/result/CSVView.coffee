# little janky, no model
class CSVView extends Backbone.View

  className: "CSVView"

  exportValueMap :
    "correct" : 1
    "checked" : 1

    "incorrect" : 0
    "unchecked" : 0

    "missing"   : "."
    "not_asked" : "."
    
    "skipped"   : 999


  initialize: ( options ) ->
  
    @assessmentId = Utils.cleanURL options.assessmentId
    
    allResults = new Results
    allResults.fetch
      key: @assessmentId
      success: (collection) =>
        @results = collection.models
        @render()
    
    @metaKeys = ["enumerator"]
    
  exportValue: (databaseValue) ->
    if @exportValueMap[databaseValue]?
      return @exportValueMap[databaseValue]
    else
      return databaseValue

  render: ->
    if @results? && @results[0]?
      tableHTML = ""

      csvRowData = []

      columns  = []
      keyChain = []

      # build column buckets, candidates win with length
      for result in @results

        orderMap = if result.has("order_map") then result.get("order_map") else [0..result.attributes.subtestData.length-1]
        
        for rawIndex in [0..result.attributes.subtestData.length-1]
          
          # use the order map for randomized subtests
          subtestIndex = orderMap.indexOf(rawIndex)
          subtest = result.attributes.subtestData[subtestIndex]

          continue if not subtest?

          subtestName = subtest.name?.toLowerCase().dasherize()
          prototype = subtest.prototype
          keyBucket = []
          # should break these out into classes at some point
          if prototype == "id"
            keyBucket.push "id"
          else if prototype == "datetime"
            keyBucket.push "year", "month", "date", "assess_time"
          else if prototype == "location"
            for label in subtest.data.labels
              keyBucket.push label
          else if prototype == "consent"
            keyBucket.push "consent"
          else if prototype == "grid"
            variableName = subtest.data.variable_name
            keyBucket.push "#{variableName}_auto_stop","#{variableName}_time_remain", "#{variableName}_attempted", "#{variableName}_item_at_time", "#{variableName}_time_intermediate_captured", "#{variableName}_correct_per_minute"
            for item, i in subtest.data.items
              keyBucket.push "#{variableName}#{i+1}"
          else if prototype == "survey"
            for surveyVariable, surveyValue of subtest.data
              if _.isObject(surveyValue)
                for optionKey, optionValue of surveyValue
                  keyBucket.push "#{surveyVariable}_#{optionKey}"
              else
                keyBucket.push surveyVariable
          else if prototype == "observation"
            for observations, i in subtest.data.surveys
              observationData = observations.data
              for surveyVariable, surveyValue of observationData
                if _.isObject(surveyValue)
                  for optionKey, optionValue of surveyValue
                    keyBucket.push "#{surveyVariable}_#{optionKey}_#{i+1}"
                else
                  keyBucket.push "#{surveyVariable}_#{i+1}"
          else if prototype == "complete"
            keyBucket.push "additional_comments", "end_time", "gps_latitude", "gps_longitude", "gps_accuracy"
        
          if not keyChain[rawIndex]?                      then keyChain[rawIndex] = []
          if keyChain[rawIndex].length < keyBucket.length then keyChain[rawIndex] = keyBucket


      @metaKeys.push "start_time", "order_map"
      columns = @metaKeys.concat(_.flatten(keyChain))

      # pop the columns into the first row
      csvRowData.push columns
      
      # fill row array with all results
      for result, d in @results
        row = []
        
        # meta columns go first
        for metaKey in @metaKeys
          if result.attributes[metaKey]? then row.push result.attributes[metaKey]
        # little backwards compatibility
        row[columns.indexOf("start_time")] = if result.has('starttime') then result.get('starttime') else result.get('start_time')

        row[columns.indexOf("order_map")] =  if result.has('order_map') then result.get('order_map') else "no_record"

        # go through each subtest in this result
        for subtest in result.attributes.subtestData
          prototype = subtest.prototype

          # each prototype provides different data, handle them accordingly
          if prototype == "id"
            row[columns.indexOf("id")] = subtest.data.participant_id
          else if prototype == "location"
            for label, i in subtest.data.labels
              row[columns.indexOf(label)] = subtest.data.location[i]
          else if prototype == "datetime"
            months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]
            if ~months.indexOf(subtest.data.month.toLowerCase())
              monthData = months.indexOf(subtest.data.month.toLowerCase()) + 1
            else
              monthData = subtest.data.month
            row[columns.indexOf("year")]        = subtest.data.year
            row[columns.indexOf("month")]       = monthData
            row[columns.indexOf("date")]        = subtest.data.day
            row[columns.indexOf("assess_time")] = subtest.data.time
            
          else if prototype == "consent"
            row[columns.indexOf("consent")] = subtest.data.consent
          
          else if prototype == "grid"
            variableName = subtest.data.variable_name
            row[columns.indexOf("#{variableName}_auto_stop")]      = subtest.data.auto_stop
            row[columns.indexOf("#{variableName}_time_remain")]    = subtest.data.time_remain
            row[columns.indexOf("#{variableName}_attempted")]      = subtest.data.attempted
            row[columns.indexOf("#{variableName}_item_at_time")]   = subtest.data.item_at_time
            row[columns.indexOf("#{variableName}_time_intermediate_captured")]   = subtest.data.time_intermediate_captured
            row[columns.indexOf("#{variableName}_correct_per_minute")]   = subtest.sum.correct_per_minute

            for item, i in subtest.data.items
              row[columns.indexOf("#{variableName}#{i+1}")] = @exportValue(item.itemResult)

          else if prototype == "survey"
            for surveyVariable, surveyValue of subtest.data
              if _.isObject(surveyValue) # multiple type question
                for optionKey, optionValue of surveyValue
                  row[columns.indexOf("#{surveyVariable}_#{optionKey}")] = @exportValue(optionValue)
              else # single type question or open
                row[columns.indexOf("#{surveyVariable}")] = @exportValue(surveyValue) # if open just show result, otherwise translate not_asked

          else if prototype == "observation"
            for observations, i in subtest.data.surveys
              observationData = observations.data
              for surveyVariable, surveyValue of observationData
                if _.isObject(surveyValue) # multiple type question
                  for optionKey, optionValue of surveyValue
                    row[columns.indexOf("#{surveyVariable}_#{optionKey}_#{i+1}")] = @exportValue(optionValue)
                else # single type question or open
                  row[columns.indexOf("#{surveyVariable}_#{i+1}")] = @exportValue(surveyValue)
              

          else if prototype == "complete"
            row[columns.indexOf("additional_comments")] = subtest.data.comment
            row[columns.indexOf("end_time")]            = subtest.data.end_time
            if subtest.data.gps?
              row[columns.indexOf("gps_latitude")]  = subtest.data.gps.latitude
              row[columns.indexOf("gps_longitude")] = subtest.data.gps.longitude
              row[columns.indexOf("gps_accuracy")]  = subtest.data.gps.accuracy


        csvRowData.push row

      # Use table2csv to create a safe csv data
      for row, i in csvRowData
        tableHTML += "<tr>"
        count = 0
        for index in [0..row.length-1]
          tableHTML += "<td>#{row[index]}</td>"
          count++
        tableHTML += "</tr>"
      
      # Anything undefined at this point was not found for this specific result
      tableHTML = tableHTML.replace(/undefined/g, "no_record")
      
      @csv = $("<table>#{tableHTML}</table>").table2CSV { "delivery" : "value" }

      # Save
      csvFile = new Backbone.Model
        "_id" : "Tangerine-#{@assessmentId.substr(-5, 5)}.csv"
      csvFile.url = "csv"
      csvFile.fetch
        complete: =>
          csvFile.save
            "csv" : @csv
          , complete : => @trigger "ready"

    @trigger "rendered"
