export class AppConfig {

  // 
  // Tangerine Flavor
  //

  // The homeUrl determines which Tangerine Flavor. Options are as follows.
  //
  // Tangerine Coach: 'case-management'
  // Tangerine Case Management: 'case-home'
  // Tangerine Teach: 'dashboard'
  homeUrl = "case-management"

  //
  // i18n configuration.
  //

  languageDirection  = "ltr"
  languageCode = "en"
  useEthiopianCalendar:boolean

  //
  // Sync configuration
  // 

  serverUrl = "http://localhost/"
  syncProtocol = '1'
  groupId:string
  groupName:string
 
  //
  // Sync Protocol 1 configuration.
  //

  uploadToken = "change_this_token"
  uploadUrl = ''
  uploadUnlockedFormReponses = false
  usageCleanupBatchSize
  minimumFreeSpace

  //
  // Sync Protocol 2 configuration.
  //

  couchdbPush4All:boolean
  couchdbPullUsingDocIds:boolean
  couchdbPushUsingDocIds:boolean
  indexViewsOnlyOnFirstSync:boolean = false
  batchSize:number
  initialBatchSize:number
  writeBatchSize:number
  findSelectorLimit: number;
  compareLimit: number;
  // List of views to skip optimization of after a sync.
  doNotOptimize: Array<string>
  // By default, User Profiles (AKA Device Users) will sync down to devices given the Sync Settings and then filtered
  // by assignment when associating accounts on the Device. Setting this to true will ensure all User Profiles are
  // Synced to all Devices and there will also be no filtering when associating Device Users to Accounts on Devices.
  disableDeviceUserFilteringByAssignment:boolean

  //
  // Account auth configuration.
  //

  listUsernamesOnLoginScreen = true
  securityQuestionText = "What is your year of birth?"
  // Regex used to validate passwords for Device accounts.
  passwordPolicy:string
  // Description of validation for passwords of Device accounts.
  passwordRecipe:string
  // Disregard password functionality.
  noPassword = false

  //
  // Profile configuration.
  //

  // This setting only applies to Sync Protocol 1.
  centrallyManagedUserProfile = false
  // Hides the user profile link to edit when on the Device.
  hideProfile = false

  //
  // Encryption configuration.
  //

  // EncryptionPlugin.sqlcipher is the default if this is not defined.
  encryptionPlugin:EncryptionPlugin
  // Turns off all app level encryption. App will then report as depending on System (disk) level encryption.
  turnOffAppLevelEncryption:boolean

  //
  // GPS configuration.
  //

  // Don't collect much GPS data and want to save battery? Set this to true to prevent the GPS chip from running constantly.
  disableGpsWarming:boolean

  //
  // Tangerine Case module configuration.
  //

  showQueries:boolean
  showCaseReports:boolean
  // Determines wether or not the Issues tab is shown on the case module's home screen.
  showIssues:boolean
  barcodeSearchMapFunction:string
  // Determines if a "Create Issue" button appears when viewing submitted Event Forms.
  allowCreationOfIssues:boolean
  filterCaseEventScheduleByDeviceAssignedLocation:boolean = false

  //
  // Tangerine Coach configuration.
  //

  columnsOnVisitsTab = []
  categories = []

  //
  // Backup configuration.
  //

  useCachedDbDumps:boolean
  dbBackupSplitNumberFiles: number;

  //
  // Experimental configuration.
  //

  // Use experimental mode in Tangy Form that only captures the properties of inputs that have changed from their original state in the form.
  saveLessFormData:boolean
  p2pSync = 'false'
  attachHistoryToDocs:boolean = false
  usePouchDbLastSequenceTracking:boolean

  //
  // @TODO Sort these.
  //

  calculateLocalDocsForLocation:boolean;
  
}

export enum EncryptionPlugin {
  SqlCipher = 'SqlCipher',
  CryptoPouch = 'CryptoPouch'
}
