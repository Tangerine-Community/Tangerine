class TripResultCollection extends Backbone.Collection

  url   : "result"
  model : TripResult

  fetch: ( options = {} ) =>

    throw "Please provide the name of a view that supplies result _ids." unless options.resultView?
    throw "Please provide a query key for the view." unless options.queryKey?

    resultView = options.resultView
    queryKey   = options.queryKey
    reduce     = options['reduce'] || false
    console.log 'lets view'
    Tangerine.db.query "tangerine/tutorTrips", {key: queryKey, reduce: reduce}
    .then (response) =>
      console.log response
      resultIds = response.rows.filter( (row) ->
        row.value != "assessment" && row.value != "klass"
      ).map (result) -> result.id


      resultsByTripId = _(response.rows.filter( (row) ->
        row.value != "assessment" && row.value != "klass"
      ).map (result) -> {tripId:result.value,docId:result.id}).indexBy("tripId")

      tripIdByResultId = _(response.rows.filter( (row) ->
        row.value != "assessment" && row.value != "klass"
      ).map (result) -> {tripId:result.value,docId:result.id}).indexBy("docId")

      Tangerine.db.query "tangerine/spirtRotut", {keys : Object.keys(resultsByTripId), group : true}
      .then (response) =>
          workflowIdByTripId = {}
          for row in response.rows
            workflowIdByTripId[row.key] = row.value.workflowId
          

          Tangerine.db.query "tangerine/csvRows", {keys : resultIds}
          .then (csvRows) =>
            trips = _(csvRows.rows.map (result) -> {cells:result.value,docId:result.id, tripId:tripIdByResultId[result.id][0].tripId}).indexBy("tripId")
            tripModels = []

            for tripId, tripResults of trips
              allCells = []
              attributes = {}

              for result in tripResults

                allCells = allCells.concat result.cells
                for cell in result.cells
                  tryCount = 1
                  tryKey   = cell.key
                  tryValue = cell.value
                  suffix   = ''

                  while true
                    if attributes[tryKey]?
                      tryKey = cell.key + "_#{tryCount}"
                      tryCount++

                    else
                      attributes[tryKey] = tryValue
                      break

              #handle the new locationIndex appropriately by setting the county, zone, and school values - this is a hack until we get something better in place
              #TODO: resolve this school location hack
              if attributes.locationIndex
                locKeyVals = attributes.locationIndex.replace(/\-([^-]*)\-/g, "-$1_")
                locKeyValArray = locKeyVals.split("_")
                for locPair in locKeyValArray
                  locArray = locPair.split("-")
                  if locArray.length == 2
                    locKey = locArray[0]
                    locVal = locArray[1]
                    attributes[locKey] = locVal

                #attributes.county = locArray[1] 

              attributes.tripId  = tripId
              attributes._id  = tripId
              attributes.rawData = allCells
              attributes.workflowId = workflowIdByTripId[tripId]
              @add new TripResult attributes

            options.success()
