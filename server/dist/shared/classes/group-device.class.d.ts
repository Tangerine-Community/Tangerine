export declare class GroupDevice {
    _id: string;
    collection: string;
    token: string;
    key: string;
    claimed: boolean;
    updatedOn: number;
    version: string;
    syncLocations: Array<LocationConfig>;
    assignedLocation: LocationConfig;
    assignedFormResponseIds: Array<string>;
}
export declare class SyncLocation {
    level: string;
    id: string;
}
export declare class LocationConfig {
    showLevels: Array<string>;
    value: any;
}
