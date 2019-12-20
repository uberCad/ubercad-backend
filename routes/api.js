var express = require('express');
var router = express.Router();

var arango = require('../services/DataServices');

/* GET users listing. */
router.get('/', async function(req, res, next) {

    let data = await arango.findAllMaterial();
console.log(data);
  res.json({
      resp: 'API entry point',
      env: process.env,
      data
  });
});

module.exports = router;
