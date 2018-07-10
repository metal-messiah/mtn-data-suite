export const environment = {
  production: true,
  envName: 'prod',
  WEB_SERVICE_HOST: 'https://mtn-rest-mtn-rest.b9ad.pro-us-east-1.openshiftapps.com',
  AUTH_CONFIG: {
    clientID: 'UTgiibU2z7Honoinje5bVRbhUwyneFN4',
    domain: 'mtnra.auth0.com',
    callbackURL: 'https://app.mtnra.com/callback'
  },
  VERSION: require('../../package.json').version
};
