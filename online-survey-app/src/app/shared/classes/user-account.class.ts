export class UserAccount {
  _id:string
  username:string
  password:string
  securityQuestionResponse:string
  userUUID:string
  initialProfileComplete:boolean
  constructor(data:any) {
    Object.assign(this, data)
    this.username = data?._id
  }
} 