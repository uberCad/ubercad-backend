var db = require('./index').getDbHandler();

var Material = db.collection('materials');

exports.findAllMaterial = async function () {
    return (await Material.all()).all();
};
