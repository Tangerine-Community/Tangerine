const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const env = process.argv[2] || 'dev';
const isProd = env === 'prod';

const targetPath = isProd
  ? './src/environments/environment.prod.ts'
  : './src/environments/environment.ts';

const envConfigFile = `
export const environment = {
  production: true,
  actor: '${process.env.XAPI_ACTOR}',
  mailTo: '${process.env.XAPI_MAIL}',
  endpoint: '${process.env.XAPI_ENDPOINT}',
  auth:  '${process.env.XAPI_AUTH}'
};`;

fs.writeFileSync(targetPath, envConfigFile, 'utf8');
console.log(`<<<<<< Angular environment.prod.ts generated! >>>>>>`);
