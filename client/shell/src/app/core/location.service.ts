import { Injectable } from '@angular/core';

@Injectable()
export class Loc {
  query(levels, criteria, locationList) {
    let currentLevelIndex, i, j, len, level, levelIDs, levelMap, locationLevels, locations, targetLevelIndex;
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
      if (levels.indexOf(aLevel => aLevel === level) === -1) {
        levelMap[i] = null;
      } else {
        levelMap[i] = level;
      }
    }
    // currentLevelIndex = this.getCurrentLevelIndex(levels, criteria, levelMap);
    // return this._query(0, currentLevelIndex, locations, levelMap, criteria);
    return this._query(0, 2, locations, levels, criteria);
  }

  _query(depth, targetDepth, data, levelMap, criteria) {
    let allChildren, i, j, len, levelData, v;
    if (depth === targetDepth) {
      return data.map(function (obj) {
        return {
          id: obj.id,
          label: obj.label
        };
      });
    }
    if ((levelMap[depth] != null) && (depth < targetDepth)) {
      if (criteria[levelMap[depth]] && data[criteria[levelMap[depth]]] && data[criteria[levelMap[depth]]].hasOwnProperty('children')) {
        return this._query(depth + 1, targetDepth, data[criteria[levelMap[depth]]].children, levelMap, criteria);
      }
    }
    if ((levelMap[depth] == null) && (depth < targetDepth)) {
      levelData = {};
      allChildren = data.map(function (loc) {
        return loc.children;
      });
      for (i = j = 0, len = allChildren.length; j < len; i = ++j) {
        v = allChildren[i];
        Object.assign(levelData, v);
      }
      return this._query(depth + 1, targetDepth, levelData, levelMap, criteria);
    }
    return {};
  }

  getCurrentLevelIndex(levels, criteria, levelMap) {
    let i, j, len, level;
    for (i = j = 0, len = levels.length; j < len; i = ++j) {
      level = levels[i];
      if (criteria[level] == null) {
        return levelMap.indexOf(level);
      }
    }
    return levelMap.indexOf((levelItem => levelItem === levels[levels.length - 1]));
  }

}