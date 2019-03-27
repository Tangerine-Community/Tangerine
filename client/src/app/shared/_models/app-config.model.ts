export class AppConfig {

  securityPolicy = ["password"]
  columnsOnVisitsTab = []
  securityQuestionText = "What is your year of birth?"
  hashSecurityQuestionResponse = false
  hideProfile = false
  registrationRequiresServerUser = false
  listUsernamesOnLoginScreen = true
  serverUrl = "http://localhost/"
  categories = []
  uploadUnlockedFormReponses = false
  groupName = ""
  uploadToken = "change_this_token"
  homeUrl = "case-management"
  centrallyManagedUserProfile = false
  languageDirection  = "ltr"
  languageCode = "en"
  // @TODO Deprecated...
  uploadUrl = ''
  syncProtocol = ''

  /*
  constructor(data = {}) {
    Object.assign(this, data)
  }

  deserialize(data = {}) {
    Object.assign(this, data)
  }
  */

}