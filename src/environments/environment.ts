// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  envName: 'dev',
  WEB_SERVICE_HOST: 'http://localhost:8080',
  REPORT_HOST: 'http://localhost:8090',
  NODE_REPORT_HOST: 'http://localhost:3000',
  AUTH_CONFIG: {
    clientID: 'UTgiibU2z7Honoinje5bVRbhUwyneFN4',
    domain: 'mtnra.auth0.com',
    callbackURL: 'http://localhost:4200/callback'
  },
  VERSION: require('../../package.json').version
};
