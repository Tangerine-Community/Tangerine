import { inject } from '@angular/core/testing';
export class AppConfig {
  columnsOnVisitsTab = []
  securityQuestionText = "What is your year of birth?"
  hideProfile = false
  listUsernamesOnLoginScreen = true
  serverUrl = "http://localhost/"
  categories = []
  uploadUnlockedFormReponses = false
  uploadToken = "change_this_token"
  homeUrl = "case-management"
  centrallyManagedUserProfile = false
  languageDirection  = "ltr"
  languageCode = "en"
  uploadUrl = ''
  syncProtocol = '1'
  minimumFreeSpace
  usageCleanupBatchSize
  barcodeSearchMapFunction:string
  showQueries:boolean
  showCaseReports:boolean
  // Determines wether or not the Issues tab is shown on the case module's home screen.
  showIssues:boolean
  groupId:string
  groupName:string
  p2pSync = 'false'
  passwordPolicy:string
  passwordRecipe:string
  couchdbPush4All:boolean
  couchdbPullUsingDocIds:boolean
  couchdbPushUsingDocIds:boolean
  autoMergeConflicts:boolean
  useEthiopianCalendar:boolean
  attachHistoryToDocs:boolean = false
  filterCaseEventScheduleByDeviceAssignedLocation:boolean = false
  disableGpsWarming:boolean
  indexViewsOnlyOnFirstSync:boolean = false
  batchSize:number
  initialBatchSize:number
  writeBatchSize:number
  // EncryptionPlugin.sqlcipher is the default if this is not defined.
  encryptionPlugin:EncryptionPlugin
  turnOffAppLevelEncryption:boolean
  useCachedDbDumps:boolean
  calculateLocalDocsForLocation:boolean;
  findSelectorLimit: number;
  compareLimit: number;
  // Determines if a "Create Issue" button appears when viewing submitted Event Forms.
  allowCreationOfIssues:boolean
  // By default, User Profiles (AKA Device Users) will sync down to devices given the Sync Settings and then filtered
  // by assignment when associating accounts on the Device. Setting this to true will ensure all User Profiles are
  // Synced to all Devices and there will also be no filtering when associating Device Users to Accounts on Devices.
  disableDeviceUserFilteringByAssignment:boolean 
  // List of views to skip optimization of after a sync.
  doNotOptimize: Array<string>
  dbBackupSplitNumberFiles: number;
  usePouchDbLastSequenceTracking:boolean
}

export enum EncryptionPlugin {
  SqlCipher = 'SqlCipher',
  CryptoPouch = 'CryptoPouch'
}
