# encoding: utf-8


class LocationList

  def initialize( options )
    @couch = options[:couch]
    @locationListDoc = @couch.getRequest({ 
      :doc => "location-list", 
      :parseJson => true 
    })

    @locationIndex ||= {}

    indexLocations(@locationListDoc["locations"], 0, [])
  end

  def indexLocations( node, depth, locMap )
    node.map { | id, loc | 
      locMap[depth] = id
      if loc.has_key?("children")
        indexLocations(loc["children"], depth+1, locMap)
      else
        @locationIndex[id] = [] | locMap
      end
    }
  end

  def retrieveLocation( key )
    treePath = @locationIndex[key]
    if treePath
      location = walkTree(@locationListDoc["locations"], 0, treePath)
      return location
    end
    return {}
  end 

  def walkTree(node, depth, path)
    if node[path[depth]]
      nodeData = node[path[depth]].select {|k,v| (k != 'id' and k != "children") }
      nodeData = Hash[nodeData.map {|k,v| ["#{titleize(@locationListDoc['locationsLevels'][depth])}#{titleize(k)}", v] }].to_a
      if (depth+1) < path.length
        nodeData = nodeData | walkTree(node[path[depth]]["children"], depth+1, path)
      end
      return nodeData
    end
    return []
  end

end
