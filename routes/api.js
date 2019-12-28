var express = require('express');
var router = express.Router();
var apiUser = require('./api/user');
var securedRoute = require('./api/securedRoute');

router.use('/user', apiUser);
router.use('/securedRoute', securedRoute);

module.exports = router;
