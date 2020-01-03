import { inject } from '@angular/core/testing';
export class AppConfig {
  securityPolicy = ["password"]
  columnsOnVisitsTab = []
  securityQuestionText = "What is your year of birth?"
  hashSecurityQuestionResponse = false
  hideProfile = false
  // "local" for associating with an existing profile, "remote" for requiring a profile to download, or "manual" for letting users create their own profile.
  associateUserProfileMode = 'manual' 
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
  syncProtocol = ''
  minimumFreeSpace
  usageCleanupBatchSize
  barcodeSearchMapFunction:string
  showQueries:boolean
  sharedUserDatabase = false
  groupId:string
  groupName:string
  p2pSync = 'false'
} 

