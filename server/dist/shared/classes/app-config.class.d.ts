export declare class AppConfig {
    homeUrl: string;
    languageDirection: string;
    languageCode: string;
    useEthiopianCalendar: boolean;
    dateFormat: string;
    serverUrl: string;
    syncProtocol: string;
    groupId: string;
    groupName: string;
    uploadToken: string;
    uploadUrl: string;
    uploadUnlockedFormReponses: boolean;
    usageCleanupBatchSize: any;
    minimumFreeSpace: any;
    batchSize: number;
    initialBatchSize: number;
    writeBatchSize: number;
    changesBatchSize: number;
    compareLimit: number;
    doNotOptimize: Array<string>;
    indexViewsOnlyOnFirstSync: boolean;
    changes_batch_size: number;
    listUsernamesOnLoginScreen: boolean;
    securityQuestionText: string;
    passwordPolicy: string;
    passwordRecipe: string;
    noPassword: boolean;
    kioskMode: boolean;
    exitClicks: number;
    centrallyManagedUserProfile: boolean;
    hideProfile: boolean;
    hideAbout: boolean;
    disableDeviceUserFilteringByAssignment: boolean;
    encryptionPlugin: EncryptionPlugin;
    turnOffAppLevelEncryption: boolean;
    disableGpsWarming: boolean;
    showQueries: boolean;
    showCaseReports: boolean;
    showIssues: boolean;
    barcodeSearchMapFunction: string;
    allowCreationOfIssues: boolean;
    allowMergeOfIssues: boolean;
    filterCaseEventScheduleByDeviceAssignedLocation: boolean;
    columnsOnVisitsTab: any[];
    categories: any[];
    teachProperties: {
        units: any[];
        unitDates: any[];
        cutoffRange: number;
        attendancePrimaryThreshold: number;
        attendanceSecondaryThreshold: number;
        scoringPrimaryThreshold: number;
        scoringSecondaryThreshold: number;
        behaviorPrimaryThreshold: number;
        behaviorSecondaryThreshold: number;
        useAttendanceFeature: boolean;
        showAttendanceCalendar: boolean;
        studentRegistrationFields: any[];
    };
    goHomeAfterFormSubmit: boolean;
    forceCompleteForms: boolean;
    useCachedDbDumps: boolean;
    dbBackupSplitNumberFiles: number;
    mediaFileStorageLocation: string;
    saveLessFormData: boolean;
    p2pSync: string;
    attachHistoryToDocs: boolean;
    usePouchDbLastSequenceTracking: boolean;
    forceNewEventFormConfirmation: boolean;
    calculateLocalDocsForLocation: boolean;
}
export declare enum EncryptionPlugin {
    SqlCipher = "SqlCipher",
    CryptoPouch = "CryptoPouch"
}
