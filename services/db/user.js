var db = require('./index').getDbHandler();
var { aql } = require('arangojs'); // not needed in arangosh
const security = require('../security');

var User = db.collection('users');

exports.findOne = function (key) {
  return User.document(key.toString());
};

exports.findOrCreateFb = async function (profile) {
  let params = {
    fbid: profile.id
  };

  let query = `
        FOR user IN users
        FILTER user.fbid == @fbid
        
        RETURN user
    `;

  let result = await db.query(query, params, { count: true });
  if (result.count > 0) {
    return result.next();
  }

  params = {
    fbid: profile.id,
    displayName: profile.displayName,
    username: `fb.${profile.id}`,
    type: 'facebook'
  };

  query = `
        LET user = (
            INSERT {
                fbid: @fbid,
                displayName: @displayName,
                username: @username,
                type: @type,
                createdAt: DATE_NOW()
            } IN users
            RETURN NEW
        )
        RETURN user[0]
    `;

  result = await db.query(query, params);
  return result.next();
};

exports.findUserByName = async function (username) {
  const params = {
    username,
    type: 'login'
  };
  const query = `
        FOR document IN users
            FILTER document.username == @username && document.type == @type
            RETURN document`;
    // return only first item
  const result = await db.query(query, params);
  return result.next();
};
exports.addUser = async function (user) {
  user.password = await security.generateHash(user.password);
  User.save(user);
};
