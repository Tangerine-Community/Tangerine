
type doc_id = string

export interface UserMembership {
  groupName:string
  role?: string
  roles?: string[]
}

export interface User {
  _id: doc_id
  username: string
  password: string
  email: string
  firstName: string
  lastName: string
  groups:Array<UserMembership>
}