export interface TangerineConfig {
  enabledModules:Array<string>
  hostName: string
  protocol: string 
  user1ManagedServerUsers: boolean
  userOneUsername: string
  userOnePassword: string
  dbAdminUsername: string
  dbAdminPassword: string
  couchdbEndpoint: string
  uploadToken: string
  reportingDelay: number
  hideSkipIf: boolean
  couchdbSync4All: boolean
  openRegistration: boolean
}
