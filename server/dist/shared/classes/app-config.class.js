"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionPlugin = exports.AppConfig = void 0;
class AppConfig {
    homeUrl = "case-management";
    languageDirection = "ltr";
    languageCode = "en";
    useEthiopianCalendar;
    dateFormat = "M/D/YYYY";
    serverUrl = "http://localhost/";
    syncProtocol = '1';
    groupId;
    groupName;
    uploadToken = "change_this_token";
    uploadUrl = '';
    uploadUnlockedFormReponses = false;
    usageCleanupBatchSize;
    minimumFreeSpace;
    batchSize;
    initialBatchSize;
    writeBatchSize;
    changesBatchSize;
    compareLimit;
    doNotOptimize;
    indexViewsOnlyOnFirstSync = false;
    changes_batch_size;
    listUsernamesOnLoginScreen = true;
    securityQuestionText = "What is your year of birth?";
    passwordPolicy;
    passwordRecipe;
    noPassword = false;
    kioskMode = false;
    exitClicks;
    centrallyManagedUserProfile = false;
    hideProfile = false;
    hideAbout = false;
    disableDeviceUserFilteringByAssignment;
    encryptionPlugin;
    turnOffAppLevelEncryption;
    disableGpsWarming;
    showQueries;
    showCaseReports;
    showIssues;
    barcodeSearchMapFunction;
    allowCreationOfIssues;
    allowMergeOfIssues;
    filterCaseEventScheduleByDeviceAssignedLocation = false;
    columnsOnVisitsTab = [];
    categories = [];
    teachProperties = {
        units: [],
        unitDates: [],
        cutoffRange: 10,
        attendancePrimaryThreshold: 80,
        attendanceSecondaryThreshold: 70,
        scoringPrimaryThreshold: 70,
        scoringSecondaryThreshold: 60,
        behaviorPrimaryThreshold: 90,
        behaviorSecondaryThreshold: 80,
        useAttendanceFeature: false,
        showAttendanceCalendar: false,
        studentRegistrationFields: []
    };
    goHomeAfterFormSubmit = false;
    forceCompleteForms = false;
    useCachedDbDumps;
    dbBackupSplitNumberFiles;
    mediaFileStorageLocation;
    saveLessFormData;
    p2pSync = 'false';
    attachHistoryToDocs = false;
    usePouchDbLastSequenceTracking;
    forceNewEventFormConfirmation = false;
    calculateLocalDocsForLocation;
}
exports.AppConfig = AppConfig;
var EncryptionPlugin;
(function (EncryptionPlugin) {
    EncryptionPlugin["SqlCipher"] = "SqlCipher";
    EncryptionPlugin["CryptoPouch"] = "CryptoPouch";
})(EncryptionPlugin || (exports.EncryptionPlugin = EncryptionPlugin = {}));
//# sourceMappingURL=app-config.class.js.map