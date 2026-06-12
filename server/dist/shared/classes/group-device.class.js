"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationConfig = exports.SyncLocation = exports.GroupDevice = void 0;
const { v4: uuidv4 } = require('uuid');
class GroupDevice {
    _id = uuidv4();
    collection = 'Device';
    token = uuidv4();
    key = uuidv4();
    claimed = false;
    updatedOn;
    version;
    syncLocations = [];
    assignedLocation = new LocationConfig();
    assignedFormResponseIds = [];
}
exports.GroupDevice = GroupDevice;
class SyncLocation {
    level;
    id;
}
exports.SyncLocation = SyncLocation;
class LocationConfig {
    showLevels;
    value;
}
exports.LocationConfig = LocationConfig;
//# sourceMappingURL=group-device.class.js.map