var db = require('./index').getDbHandler();
var aql = require('arangojs').aql; // not needed in arangosh

var ObjectHandler = db.collection('objects');

exports.get = async function (key, user) {
    const params = {
        userId: user._key,
        key
    };

    const query = `
        FOR object IN objects
           FILTER object.createdBy == @userId
           FILTER object._key == @key

        RETURN object`;

    const result = await db.query(query, params);
    return result.next();
};
