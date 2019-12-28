var config = require('../config');
var Index = new (require('arangojs')).Database({
    url: config.ARANGO_HOST
});

Index.useDatabase(config.ARANGO_DB);
Index.useBasicAuth(config.ARANGO_USER, config.ARANGO_PASS);

exports.getDbHandler = function () {
    return Index;
};



//
//
// var Material = Index.collection('materials');
// // Save a new article with title and description as required fields
// exports.findAllMaterial = function () {
//     return Material.all();
// };
//
