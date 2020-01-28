export class UserSignup {
  adminPassword:string
  username:string
  password:string
  securityQuestionResponse:string
  constructor(data) {
    Object.assign(this, data)
  }
}