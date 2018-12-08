export const environment = {
  production: false,
  envName: 'test',
  WEB_SERVICE_HOST: 'https://mtn-rest-service.herokuapp.com',
  AUTH_CONFIG: {
    clientID: 'UTgiibU2z7Honoinje5bVRbhUwyneFN4',
    domain: 'mtnra.auth0.com',
    callbackURL: 'http://localhost:4200/callback'
  },
  VERSION: require('../../package.json').version
};
