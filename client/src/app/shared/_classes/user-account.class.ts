import * as crypto from 'crypto-js'

export class UserAccount {
  _id:string
  keyBox:string
  username:string
  password:string
  securityQuestionResponse:string
  userUUID:string
  initialProfileComplete:boolean
  constructor(data:any) {
    Object.assign(this, data)
    this.username = data._id
  }
  get key() {
    const bytes  = crypto.AES.decrypt(this.keyBox, this.password);
    return bytes.toString(crypto.enc.Utf8);
  }

} 