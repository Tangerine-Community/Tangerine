'use strict';

module.exports = {}

var log = console.log
var axios = require('axios')
var db = axios.create({
  baseURL: 'http://admin:password@localhost/db/group-national_tablet_program/',
  timeout: 999999000,
  headers: {'Content-Type': 'application/json'}
});

// A classic sleep function.
async function sleep(seconds) {
  return new Promise(function(resolve, reject) {
    let ms = seconds*1000
    setTimout(resolve, ms)
  })
}

module.exports.get = async function byWorkflowIdMonthYear(options) {

    let workflowId = options.workflowId
    let year = options.year
    let month = options.month

    // PORT: Start code from ./brockman/routes/workflow.rb
    var groupSettings = (await db.get('settings')).data
    let groupTimeZone = groupSettings['timeZone']    
    let locationList = (await db.get('location-list')).data 
    let workflow = (await db.get(workflowId)).data
    let workflowName = workflow['name']

    log(`Beginning ${workflowName}`)

    // Get results filtered by date where the value key in the view is the Trip ID.
    var response = await db.post(`/_design/ojai/_view/tutorTrips?reduce=false`, { 
      "keys": [`year${year}month${month}workflowId${workflowId}`],
    })
    let resultByDate = response.data.rows

    // Transform resultByDate into an object where keys are Trip ID and value is an array of Result IDs called resultsByTripId. 
    let resultsByTripId = {}
    let allTripIds = []
    resultByDate.forEach(function(row) {
      var tripId = row['value']
      resultsByTripId[tripId]  = (!resultsByTripId[tripId]) ? [] : resultsByTripId[tripId] 
      resultsByTripId[tripId].push(row['id'])
      allTripIds.push(tripId)
    })

    debugger

    // @TODO This looks unnessecary. resultsByTripId is already built.
    allTripIds.map(function(tripId) { 
      resultsByTripId[tripId]  = (!resultsByTripId[tripId]) ? [] : resultsByTripId[tripId] 
    })

    debugger

    // End ported code from ./brockman/routes/workflow.rb

    // Start ported code from ./brockman/helpers/Csv.rb#Csv.doWorkflow

    let machineNames = []
    let columnNames  = []
    let indexByMachineName = {}

    // @TODO Needs porting.
    //let files = await getFiles()

    let throttle = 0

    // save all the result ids in order so we can can grab chunks
    // @TODO I thik this is unnessesary. 
    this.orderedResults = []
    for (var tripId in resultsByTripId) {
      let resultIds = resultsByTripId[tripId] 
      this.orderedResults.concat(resultIds) 
    }

    // go through each trip and it's array of resultIds.
    for (var tripId in resultsByTripId) {
      let resultIds = resultsByTripId[tripId] 

      // make an array of resultIds for this trip
      // The above comment is off the mark. This makes an array of Result Document Objects for the Trip.
      // results = resultIds.map(function (resultId) { getResult(resultId) })
      // @TODO getResult using an in memory cache? Not so sure that helps much.
      var results = []
      for (let resultId of resultIds) { 
        var result = await (db.get(resultId)).data
        results.push(result)
      }

      debugger

      throttle = throttle + 1

      if ((throttle % 500) == 0) {
        log("Throttling...")
        await sleep(3)
      }

      let row = []

      for (resultsIndex = 0; resultsIndex < results.length; resultsIndex++) {
        let result = results[resultIndex]

        if (!result) continue;

        result.forEach(function(cell) { // result might be an Obj

          let key         = cell['k']
          let value       = cell['v']
          let machineName = cell['m'] + resultIndex.toString()

          // hack for handling time
          // PORT!
          let isTimeRelated = key.match(/timestamp/) || key.match(/start_time/) || key.match(/startTime/)
          /*
          isntFalsy     = ! ( value.nil? || value == "" || value == 0 )
          if isTimeRelated && isntFalsy && groupTimeZone.nil?  then value = Time.at(value.to_i / 1000).strftime("%yy %mm %dd %Hh %Mm %Ss") end
          if isTimeRelated && isntFalsy && !groupTimeZone.nil? then value = Time.at(value.to_i / 1000).getlocal(groupTimeZone).strftime("%yy %mm %dd %Hh %Mm %Ss") end

          unless indexByMachineName[machineName] # Have we seen the machine name before?
            machineNames.push machineName
            columnNames.push key
            indexByMachineName[machineName] = machineNames.index(machineName)

          end

          index = indexByMachineName[machineName]

          row[index] = value
          */

        })

      }

      //files[:body].write row.map { |title| "\"#{title.to_s.gsub(/"/,'”')}\"" }.join(",") + "\n"

    }
    /*
    files[:header].write columnNames.map { |title| "\"#{title.to_s.gsub(/"/,'”')}\"" }.join(",") + "\n"

    files[:header].close()
    files[:body].close()

    `cat #{files[:headerUri]} #{files[:bodyUri]} > #{files[:fileUri]}`

    return { :uri => files[:fileUri], :name => files[:fileName] }
    */
}

/*
  def getFiles()

    path = File.join( BASE_PATH, @path )

    # ensure group directory
    unless File.exists?( path )
      Dir.mkdir( path )
    end

    fileName = @name.downcase().gsub( /[^a-zA-Z0-9]/, "-" ) + ".csv"
    fileUri  = File.join( path, fileName )

    bodyFileName = @name.downcase().gsub( /[^a-zA-Z0-9]/, "-" ) + ".csv.body"
    bodyUri      = File.join( path, bodyFileName )
    bodyFile     = File.open( bodyUri, 'w' )

    headerFileName = @name.downcase().gsub( /[^a-zA-Z0-9]/, "-" ) + ".csv.header"
    headerUri      = File.join( path, headerFileName )
    headerFile     = File.open( headerUri, 'w' )

    return {
      :header  => headerFile, :headerUri => headerUri,
      :body    => bodyFile,   :bodyUri   => bodyUri,
      :fileUri => fileUri,    :fileName  => fileName
    }

  end
*/
