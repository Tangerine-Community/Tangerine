class SchoolListView extends Backbone.View


  WORKFLOW_NO_BOOKS   : "00b0a09a-2a9f-baca-2acb-c6264d4247cb"
  WORKFLOW_WITH_BOOKS : "c835fc38-de99-d064-59d3-e772ccefcf7d"

  events:
    "click .schools-left"   : "toggleSchoolList"

  toggleSchoolList: ->
    @$el.find(".school-list").toggle()

  initialize: (options) ->
    @locLevels       = ["county", "zone", "school"]
    @geography       = {}
    @visited         = {}
    @schools         = { left : [] , done : [] }

    if Tangerine.user.has("location")
      @currentLocation = Tangerine.user.get("location")
      @invalid = false
    else
      @invalid = true

    @locationSubtest = {}

    Utils.execute [
      @fetchLocations
      @fetchTrips
      @render
    ], @


  fetchLocations: ( callback = $.noop ) ->

    return if @invalid
    # get school names for specified county and zone
    console.log "Current Location: ", @currentLocation 
    
    Loc.query @locLevels, 
      county : @currentLocation.county
      zone   : @currentLocation.zone
    , (res) =>
      @allSchools = res.map (el) -> el.id

      console.log "All School IDs: ", @allSchools

      @schoolNames = res.reduce ( (obj, cur) -> obj[cur.id]=cur.label; return obj ), {}
      
      #get county names
      Loc.query @locLevels, {}, (res) =>
        @countyNames = res.reduce ( (obj, cur) -> obj[cur.id]=cur.label; return obj ), {}

        # get zone names in county
        Loc.query @locLevels, county: @currentLocation.county
        , (res) =>
          @zoneNames = res.reduce ( (obj, cur) -> obj[cur.id]=cur.label; return obj ), {}
          callback()


  fetchTrips: (callback = $.noop) ->
    return callback() if @invalid

    trips = new TripsByUserIdYearMonthCollection()
    trips.params = {
      userId: Tangerine.user.id,
      month: moment(Date.now()).format('MM')
      year: moment(Date.now()).format('YYYY')
    }
    trips.on 'sync', =>

      schoolIds = []

      for trip in trips.models

        # skip unless they belong in this list
        #isThisTutor = trip.get("enumerator") in [Tangerine.user.get("name")].concat(Tangerine.user.getArray("previousUsers"))
        #isRightWorkflow = trip.get("workflowId") in [@WORKFLOW_NO_BOOKS, @WORKFLOW_WITH_BOOKS]
        #isValid = trip.get("tripId") in @validObservationView.validTrips
        #continue unless isThisTutor
        #continue unless isRightWorkflow
        #continue if trip.get('tripId') in incompleteTrips
        #continue unless isValid
        console.log 'flula'
        continue unless trip.get('authenticity')
        continue unless trip.get('endTime')
        continue unless trip.get('locationData')
        locationData = trip.get('locationData') 
        schoolIds.push locationData.location[locationData.labels.indexOf('school')]

      @visited = {}


      doOne = =>
        if schoolIds.length is 0
          return finish()

        schoolId = schoolIds.pop()
        if _.contains @allSchools, schoolId
          @visited[schoolId] = true
          
        doOne()

      finish = =>
        if !_.isEmpty @visited
          @schools.done = Object.keys(@visited).sort()
        else
          @schools.done = []
        # use list of all schools in county/zone
        @schools.all  = @allSchools
        @schools.left = _(@allSchools).difference(@schools.done)

        @ready = true
        callback?()

      doOne()

    trips.fetch()

  render: (status) ->
    if @invalid
      return @$el.html "
        <p>Location information invalid.</p>
        <p>Your user has no location or an invalid location set. You can create a new user, or click your user name to change your location.</p>
      "

    if status is "loading" or not @ready
      return @$el.html "<h2>School List</h2><p>Loading...</p>"

    @$el.html "

      <h2>School List</h2>
      <table class='class_table'>
        <tr><th>County</th><td>#{@countyNames[@currentLocation.county]}</td></tr>
        <tr><th>Zone</th><td>#{@zoneNames[@currentLocation.zone]}</td></tr>
        <tr><th>Schools remaining</th><td><button class='schools-left command'>#{@schools.left.length}</button></td></tr>
      </table>

      <table class='class_table school-list start-hidden'>
        <tr><td><b>Remaining</b></td></tr>
        #{("<tr><td>#{@schoolNames[school]}</td></tr>" for school in @schools.left).join('')}
      </table>

      <table class='class_table school-list start-hidden'>
        <tr><td><b>Done</b></td></tr>
        #{("<tr><td>#{@schoolNames[school]}</td></tr>" for school in @schools.done).join('')}
      </table>

    "
    @toggleSchoolList()
