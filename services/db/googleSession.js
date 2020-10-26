var db = require('./index').getDbHandler();
var { aql } = require('arangojs');
// not needed in arangosh
var GoogleSession = db.collection('google_session');

exports.getSession = async function () {
  try {
    const cursor = await db.query(aql`
        FOR document IN google_session
            RETURN document`);
    // return only first item
    const result = await cursor.next();
    if (!result) {
      throw (new Error('No session'));
    }
    return JSON.parse(result.session);
  }
  catch (e) {
    throw (new Error('Getting session failed'));
  }
};

exports.setSession = async function (token) {
  GoogleSession.save({
    session: JSON.stringify(token)
  });
};
