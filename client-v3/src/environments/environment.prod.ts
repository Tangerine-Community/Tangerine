export const environment = {
  production: true,
  securityPolicy: ['password'],
  uploadUserCredentials: {
    username: 'admin',
    password: 'password'
  },
  remoteCouchDBHost: 'http://admin:password@localhost:5984/',
  databasesToSync: ['tangerine-form-sessions', 'groups', 'locations']
};
