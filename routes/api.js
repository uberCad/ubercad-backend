var express = require('express');
var router = express.Router();
var apiUser = require('./api/user');
var securedRoute = require('./api/securedRoute');
var calculatePrice = require('./api/calculatePrice');

router.use('/user', apiUser);
router.use('/securedRoute', securedRoute);
router.use('/calculate', calculatePrice);

module.exports = router;
