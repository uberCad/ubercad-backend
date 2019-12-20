var config = require('./config');
var DB = new (require('arangojs')).Database({
    url: config.ARANGO_HOST
});

DB.useDatabase(config.ARANGO_DB);
DB.useBasicAuth(config.ARANGO_USER, config.ARANGO_PASS);

var Material = DB.collection('materials');
// Save a new article with title and description as required fields
exports.findAllMaterial = function () {
    return Material.all();
};

