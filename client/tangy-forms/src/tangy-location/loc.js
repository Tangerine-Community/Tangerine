
var Loc = {
  query (levels, criteria, qCallback, context) {
    var currentLevelIndex, i, j, len, level, levelIDs, levelMap, locationLevels, locations, resp, targetLevelIndex;
    if (criteria == null) {
      criteria = {};
    }
    locations = window.locationList.locations;
    locationLevels = window.locationList.locationsLevels;
    targetLevelIndex = 0;
    levelIDs = [];
    levelMap = [];
    for (i = j = 0, len = locationLevels.length; j < len; i = ++j) {
      level = locationLevels[i];
      if (_.indexOf(levels, level) === -1) {
        levelMap[i] = null;
      } else {
        levelMap[i] = level;
      }
    }
    currentLevelIndex = Loc.getCurrentLevelIndex(levels, criteria, levelMap);
    resp = Loc._query(0, currentLevelIndex, locations, levelMap, criteria);
    return setTimeout(function(cb) {
      if (resp.length === 0) {
        return cb.apply(context, [null]);
      } else {
        return cb.apply(context, [resp]);
      }
    }, 0, qCallback);
  },

  _query (depth, targetDepth, data, levelMap, criteria) {
    var allChildren, i, j, len, levelData, v;
    if (depth === targetDepth) {
      return _.map(data, function(obj) {
        return {
          id: obj.id,
          label: obj.label
        };
      });
    }
    if ((levelMap[depth] != null) && (depth < targetDepth)) {
      if (criteria[levelMap[depth]]) {
        return Loc._query(depth + 1, targetDepth, data[criteria[levelMap[depth]]].children, levelMap, criteria);
      }
    }
    if ((levelMap[depth] == null) && (depth < targetDepth)) {
      levelData = {};
      allChildren = _.map(data, function(loc) {
        return loc.children;
      });
      for (i = j = 0, len = allChildren.length; j < len; i = ++j) {
        v = allChildren[i];
        _.extend(levelData, v);
      }
      return Loc._query(depth + 1, targetDepth, levelData, levelMap, criteria);
    }
    console.log("_query: (depth, targetDepth, data, levelMap, criteria)", depth, targetDepth, data, levelMap, criteria);
    console.log("ERROR: Cannot find location. I should never reach this.");
    return {};
  },

  getCurrentLevelIndex (levels, criteria, levelMap) {
    var i, j, len, level;
    for (i = j = 0, len = levels.length; j < len; i = ++j) {
      level = levels[i];
      if (criteria[level] == null) {
        return _.indexOf(levelMap, level);
      }
    }
    return _.indexOf(levelMap, _.last(levels));
  }

}