var express = require('express');
var router = express.Router();
var apiUser = require('./api/user');

var arango = require('../services/DataServices');

/* GET users listing. */
router.get('/', async function (req, res, next) {
    let data = await arango.findAllMaterial();
    res.json({
        resp: 'API test entry point',
        env: process.env,
        data
    });
});

router.use('/user', apiUser);


module.exports = router;
