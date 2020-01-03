var express = require('express');
var router = express.Router();
var apiAuth = require('./api/auth');
var apiProjects = require('./api/projects');
var apiProject = require('./api/project');
var securedRoute = require('./api/securedRoute');
var calculatePrice = require('./api/calculatePrice');

router.use('/auth', apiAuth);
router.use('/projects', apiProjects);
router.use('/project', apiProject);
router.use('/securedRoute', securedRoute);
router.use('/calculate', calculatePrice);

module.exports = router;
