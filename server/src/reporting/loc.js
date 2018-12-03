

class Loc {
  /*
   * @returns FlatLocationList {locations: [ LocationNodeWithParentRef, ... ], locationsLevels: [ ... ]}
   */
  static flatten(locationList = { locations: {}, locationsLevels: []}) {
    let locations = []
    let levels = [ ...locationList.locationsLevels ]
    function dig(node, levelIndex=0) {
      if (!node.children) return
      const level = levels[levelIndex]
      let children = []
      for (let id in node.children) {
        children.push(Object.assign({}, node.children[id], { level }))
      }
      while (children && children.length > 0) {
        let freshNode = children.pop()
        locations.push(Object.assign({}, freshNode, {parent: node.id, children: {}}))
        dig(freshNode, levelIndex+1)
      }
    }
    dig({children: locationList.locations, id: 'root'}, 0)
    return Object.assign({}, locationList, { locations })
  }
  /*
   * @returns LocationList {locations: { ... }, locationsLevels: [ ... ]}
   */
  static unflatten(flatLocationList = { locations: [], locationsLevels: []}) {
    const root = {
      id: 'root',
      children: {}
    }
    function magnet(node) {
      node.children = flatLocationList.locations 
        .filter(location => location.parent === node.id) 
        .reduce((childrenObject, location) => Object.assign(childrenObject, { [location.id]: location }), {})
      for (let id in node.children) {
        magnet(node.children[id])
      }
    }
    magnet(root)
    return Object.assign({}, flatLocationList, { locations: root.children })
  }

  /*
   * Takes a location list and a list of IDs to filter by. It finds the paths those IDs and then filters out any locations not on that path.
   * Lastly if includeDescendents paramets is true, it also attaches all decendents of the IDs specified in filterByIds.
   * 
   */
  static filterById(locationList = {locations: {}, locationsLevels: []}, filterByIds = [], includeDecendents=true) {
    const locations = this.flatten(locationList).locations
    // Find full paths to IDs then combine and deduplicate.
    const allCrumbs = filterByIds
      .map(id => {
        let breadcrumbs = [id]
        let parent = locations.find(location => id === location.id).parent
        breadcrumbs.push(parent.slice())
        while (parent !== 'root') {
          parent = locations.find(location => parent === location.id).parent
          breadcrumbs.push(parent.slice())
        }
        return breadcrumbs.reverse()
      })
      .reduce((allCrumbs, path) => [...new Set([...allCrumbs, ...path])], [])
    // Get locations based on all the crumbs we just found.
    let filteredLocations = locations.filter(location => allCrumbs.indexOf(location.id) !== -1)
    if (includeDecendents) {
      // find leaves, AKA nodes with no children.
      const leaves = filteredLocations.reduce((leaves, location) => {
        // If the location is a parent, then continue, otherwise add to leaves.
        if (filteredLocations.filter(filteredLocation => filteredLocation.parent === location.id).length > 0) {
          return leaves 
        } else {
          return [...leaves, location]
        }
      }, [])
      // Get decendents of the leaves and then push them into filteredLocations.
      for (let leaf of leaves) {
        this.findDecendents(locations, leaf.id).forEach(location => filteredLocations.push(location))
      }
    } 
    return this.unflatten(Object.assign({}, locationList, {locations: filteredLocations}))
  }

  // Given a parent location ID and a level, returns an array of decendents at the level specified.
  static filterToDecendentsByParentIdAndLevel(locationList = {locations: {}, locationsLevels: []}, byParentId='', byLevel='') {
    const flatLocations = this.flatten(locationList).locations
    const decendents = this.findDecendents(flatLocations, byParentId).filter(locationNode => locationNode.level === byLevel)
    return decendents
  }

  static findDecendents(flatLocations, locationId) {
    let decendents = []
    function dig(locationId) {
      let found = flatLocations.filter((location) => location.parent === locationId)
      found.forEach(location => {
        decendents.push(location)
        dig(location.id)
      })
    }
    dig(locationId)
    return decendents
  }

}

module.exports = Loc
