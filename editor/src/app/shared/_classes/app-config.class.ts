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
  groupId:string
  groupName:string
  p2pSync = 'false'
  passwordPolicy:string
  passwordRecipe:string
  attachHistoryToDocs:boolean = false
  // Use experimental mode in Tangy Form that only captures the properties of inputs that have changed from their original state in the form.
  saveLessFormData:boolean
}

