var db = require('./index').getDbHandler();
var aql = require('arangojs').aql; // not needed in arangosh
var bcrypt = require('bcrypt-nodejs');

var User = db.collection('users');

exports.findOne = function (key) {
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
exports.addUser = function (user) {
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            throw err;
        }
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) {
                throw err;
            }
            user.password = hash;

            User.save(user)
        });
    });


};