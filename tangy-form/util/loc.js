export class Loc {
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
    for (let level of [...flatLocationList.locationsLevels].reverse()) {
      flatLocationList
        .locations
        .filter(node => node.level === level)
        .forEach(node => {
          // not calculating children, have to come up from parent
          const children = flatLocationList.locations.filter(potentialChild => potentialChild.parent === node.id)
            .reduce((locationsById, node) => { return {...locationsById, [node.id]: node}}, {})
          node.children = children
        })
    }
    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return;
          }
          seen.add(value);
        }
        return value;
      };
    };
    return JSON.parse(JSON.stringify({
      ...flatLocationList,
      locations: flatLocationList.locations
        .filter(node => node.level === flatLocationList.locationsLevels[0])
        .reduce((locationsById, node) => { return {...locationsById, [node.id]: node}}, {})
    }, getCircularReplacer()))
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

  // Given a parent location ID and a level, returns an array of decendents at the level specified.
  static flatFilterToDecendentsByParentIdAndLevel(flatLocationList = {locations: {}, locationsLevels: []}, byParentId='', byLevel='') {
    const flatLocations = flatLocationList.locations
    const decendents = this.findDecendents(flatLocations, byParentId).filter(locationNode => locationNode.level === byLevel)
    return decendents
  }

  static findDecendents(flatLocations, locationId) {
    let decendents = []
    // Could be a problem here.
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

  static calculateDescendantCounts(locationList = {}) {
    const flatLocationList = this.flatten(locationList)
    for (let level of [...locationList.locationsLevels].reverse()) {
      flatLocationList
        .locations
        .filter(node => node.level === level)
        .forEach(node => {
          // not calculating children, have to come up from parent
          const children = flatLocationList.locations.filter(potentialChild => potentialChild.parent === node.id)
          if (children.length > 0) {
            node.descendantsCount = children.reduce((descendantsCount, childNode) => {
              // If the child has no descendants, then that child IS a descendant so count it as one,
              // otherwise aggregate descendantsCounts up.
              return childNode.descendantsCount === 0
                ? descendantsCount + 1
                : descendantsCount + childNode.descendantsCount 
            }, 0)
          } else {
            node.descendantsCount = 0
          }
        })
    }
    return this.unflatten(flatLocationList)
  }

  getLineage(id, locationList) {
    const flatLocationList = this.flatten(locationList)
    const locations = flatLocationList.locations
    let breadcrumbs = [id]
    let parent = locations.find(location => id === location.id).parent
    breadcrumbs.push(parent.slice())
    while (parent !== 'root') {
      parent = locations.find(location => parent === location.id).parent
      breadcrumbs.push(parent.slice())
    }
    breadcrumbs.pop()
    return breadcrumbs
      .map(breadcrumb => locations.find(node => node.id === breadcrumb))
      .reverse()
  }

  static query (levels, criteria, locationList, qCallback, context) {
    var currentLevelIndex, i, j, len, level, levelIDs, levelMap, locationLevels, locations, resp, targetLevelIndex;
    if (criteria == null) {
      criteria = {};
    }
    locations = locationList.locations;
    locationLevels = locationList.locationsLevels;
    targetLevelIndex = 0;
    levelIDs = [];
    levelMap = [];
    for (i = j = 0, len = locationLevels.length; j < len; i = ++j) {
      level = locationLevels[i];
      if (levels.indexOf(level) === -1) {
        levelMap[i] = null;
      } else {
        levelMap[i] = level;
      }
    }
    currentLevelIndex = Loc.getCurrentLevelIndex(levels, criteria, levelMap);
    resp = Loc._query(0, currentLevelIndex, locations, levelMap, criteria);
    qCallback(resp)
  }

  static _query (depth, targetDepth, data, levelMap, criteria) {
    var allChildren, i, j, len, levelData, v;
    if (depth === targetDepth) {
      return Object.keys(data).map(key => data[key]).map(function(obj) {
        return {
          id: obj.id,
          label: obj.label
        };
      });
    }
    if ((levelMap[depth] != null) && (depth < targetDepth)) {
      if (criteria[levelMap[depth]] && data[criteria[levelMap[depth]]] && data[criteria[levelMap[depth]]].hasOwnProperty('children')) {
        return Loc._query(depth + 1, targetDepth, data[criteria[levelMap[depth]]].children, levelMap, criteria);
      }
    }
    if ((levelMap[depth] == null) && (depth < targetDepth)) {
      levelData = {};
      allChildren = Object.keys(data).map(key => data[key]).map(function(loc) {
        return loc.children;
      });
      for (i = j = 0, len = allChildren.length; j < len; i = ++j) {
        v = allChildren[i];
        Object.assign(levelData, v);
      }
      return Loc._query(depth + 1, targetDepth, levelData, levelMap, criteria);
    }
    console.log("_query: (depth, targetDepth, data, levelMap, criteria)", depth, targetDepth, data, levelMap, criteria);
    console.log("ERROR: Cannot find location. I should never reach this.");
    return {};
  }

  static getCurrentLevelIndex (levels, criteria, levelMap) {
    var i, j, len, level;
    for (i = j = 0, len = levels.length; j < len; i = ++j) {
      level = levels[i];
      if (criteria[level] == null) {
        return levelMap.indexOf(level);
      }
    }
    return levelMap.indexOf(levels[levels.length-1]);
  }

}
