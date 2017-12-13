# Communicates with the location view
class Loc



  @query: (levels, criteria = {}, qCallback, context) ->

    locations = Tangerine.locationList.get "locations"
    locationLevels = Tangerine.locationList.get "locationsLevels"

    targetLevelIndex = 0
    levelIDs = []
    levelMap = []

    for level, i in locationLevels
      if _.indexOf(levels, level) == -1
        levelMap[i] = null
      else
        levelMap[i] = level

    currentLevelIndex = Loc.getCurrentLevelIndex(levels, criteria, levelMap)

    #console.log "Loc._query(0, currentLevelIndex, locations, levelMap, criteria)", 0, currentLevelIndex, locations, levelMap, criteria
    resp = Loc._query(0, currentLevelIndex, locations, levelMap, criteria)

    setTimeout (cb) ->
      if resp.length is 0
        cb.apply context, [null]
      else
        cb.apply context, [resp]
    , 0, qCallback

    # console.log "levelMap: ", levelMap
    # console.log "currentLevelIndex: ", currentLevelIndex
    # console.log "resp: ", resp


  @_query: (depth, targetDepth, data, levelMap, criteria) ->

    #console.log "_query: (depth, targetDepth, data, levelMap, criteria)", depth, targetDepth, data, levelMap, criteria

    if depth == targetDepth
      return _.map data, (obj) ->
        return { id: obj.id, label: obj.label}

    if (levelMap[depth]?) and (depth < targetDepth)
      if criteria[levelMap[depth]]
        # console.log "took high road"
        return Loc._query (depth + 1), targetDepth, data[criteria[levelMap[depth]]].children, levelMap, criteria

    if (not levelMap[depth]?) and (depth < targetDepth)
      levelData = {}
      # console.log "took low road"
      allChildren = _.map data, (loc) ->
        return loc.children
      for v, i in allChildren
        _.extend levelData, v
 
      return Loc._query (depth + 1), targetDepth, levelData, levelMap, criteria
    console.log "_query: (depth, targetDepth, data, levelMap, criteria)", depth, targetDepth, data, levelMap, criteria
    console.log "ERROR: Cannot find location. I should never reach this."
    return {}

  @getCurrentLevelIndex: (levels, criteria, levelMap) ->
    for level, i in levels
      if not criteria[level]?
        return _.indexOf(levelMap, level)
    return _.indexOf(levelMap, _.last(levels))

  
    



  
      
    

  # criteria can be some appropriate combination of county: "", zone: "", school: "".
  # if it's {key:""} then it will look up "key-YOURKEY"
  # @query: (criteria, callback, context) ->
  #   if not criteria?
  #     key = "counties"
  #   else if criteria.key?
  #     key = "key-#{criteria.key}"
  #   else if criteria.parents?
  #     key = "parents-#{criteria.parents}"
  #   else
  #     key = Loc.getKey criteria

  #   @_query(key, callback, context)

  # @_query: (key, callback, context) ->
  #   $.couch.db(Tangerine.db_name).view "#{Tangerine.design_doc}/location",
  #     key : key
  #     error: -> console.error arguments
  #     success: (res) ->
  #       if res.rows.length is 0
  #         callback.apply context, [null]
  #       else
  #         callback.apply context, [res.rows[0].value]


  # @getKey: (criteria) ->
  #   criteriaArray = []
  #   criteriaArray.push("county-#{criteria.county}") if criteria.county?
  #   criteriaArray.push("zone-#{criteria.zone}")     if criteria.zone?
  #   criteriaArray.push("school-#{criteria.school}") if criteria.school?
  #   return criteriaArray.join("-")

