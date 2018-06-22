export const environment = {
  production: true,
  envName: 'prod',
  WEB_SERVICE_HOST: 'https://mtn-test-mtn-test-service.7e14.starter-us-west-2.openshiftapps.com',
  AUTH_CONFIG: {
    clientID: 'UTgiibU2z7Honoinje5bVRbhUwyneFN4',
    domain: 'mtnra.auth0.com',
    callbackURL: 'https://mtn-app-suite.firebaseapp.com/callback'
  },
  VERSION: require('../../package.json').version
};
