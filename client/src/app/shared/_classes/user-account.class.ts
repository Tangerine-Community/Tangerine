export class UserAccount {
  _id:string
  username:string
  password:string
  securityQuestionResponse:string
  userUUID:string
  initialProfileComplete:boolean
  constructor(_id:string, password:string, securityQuestionResponse:string, userUUID:string, initialProfileComplete:boolean) {
    this._id = _id 
    this.username = _id 
    this.password = password
    this.securityQuestionResponse = securityQuestionResponse
    this.userUUID = userUUID
    this.initialProfileComplete = initialProfileComplete
  }

} 