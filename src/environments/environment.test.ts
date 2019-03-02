export const environment = {
  production: false,
  envName: 'dev',
  WEB_SERVICE_HOST: 'https://mtn-rest-service.herokuapp.com',
  REPORT_HOST: 'http://localhost:8090',
  NODE_REPORT_HOST: 'http://localhost:3000',
  AUTH_CONFIG: {
    clientID: 'UTgiibU2z7Honoinje5bVRbhUwyneFN4',
    domain: 'mtnra.auth0.com',
    callbackURL: 'http://localhost:4200/callback'
  },
  VERSION: require('../../package.json').version
};
