var db = require('./index').getDbHandler();
var aql = require('arangojs').aql; // not needed in arangosh
let security = require('../security');

var User = db.collection('users');

exports.findOne = function (key) {
    return User.document(key.toString());
};

exports.findOrCreate = function (key) {
    return User.document(key.toString());
};

exports.findUserByName = async function (username) {
    let cursor = await db.query(aql`
        FOR document IN users
            FILTER document.username == ${username}
            RETURN document`);
    //return only first item
    return cursor.next();
};
exports.addUser = async function (user) {
    user.password = await security.generateHash(user.password);
    User.save(user)
};