export class UserSignup {
  username:string
  password:string
  securityQuestionResponse:string
  constructor(username:string, password:string, securityQuestionResponse:string) {
    this.username = username
    this.password = password
    this.securityQuestionResponse = securityQuestionResponse
  }

}