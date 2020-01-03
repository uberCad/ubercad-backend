var express = require('express');
var router = express.Router();
var passport = require('passport');
var projectDb = require('../../services/db/project');

router.use(passport.authenticate('jwt', { session: false}));



module.exports = router;

