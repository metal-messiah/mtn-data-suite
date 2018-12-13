export const environment = {
  production: false,
  envName: 'test',
  WEB_SERVICE_HOST: 'https://mtn-rest-mtn-rest.b9ad.pro-us-east-1.openshiftapps.com',
  AUTH_CONFIG: {
    clientID: 'UTgiibU2z7Honoinje5bVRbhUwyneFN4',
    domain: 'mtnra.auth0.com',
    callbackURL: 'http://localhost:4200/callback'
  },
  VERSION: require('../../package.json').version
};
