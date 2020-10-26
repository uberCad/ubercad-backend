const { google } = require('googleapis');
const config = require('./config');
const googleSession = require('./db/googleSession');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function authorize(credentials, code) {
  return new Promise(async (resolve, reject) => {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    try {
      const token = await googleSession.getSession();

      oAuth2Client.setCredentials(token);
      resolve(oAuth2Client);
    }
    catch (e) {
      console.log('authorize promise catch', e);
      try {
        getNewToken(oAuth2Client, code, resolve);
      }
      catch (e) {
        reject(e.toString());
      }
    }
  });
}

function getNewToken(oAuth2Client, code, callback) {
  if (!code) {
    console.log('no code');
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    throw (new Error(`Authorize this app by visiting this url: ${authUrl}`));
  }

  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error while trying to retrieve access token', err);
    oAuth2Client.setCredentials(token);
    // Store the token to disk for later program executions

    googleSession.setSession(token);
    callback(oAuth2Client);
  });
}

exports.getAuth = function (code) {
  console.log('getAuth');
  return authorize(config.GOOGLE_CREDENTIALS, code);
};
