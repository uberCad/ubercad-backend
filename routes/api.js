var express = require('express');
var router = express.Router();
var apiAuth = require('./api/auth');
var apiProjects = require('./api/projects');
var apiProject = require('./api/project');
var apiSnapshot = require('./api/snapshot');
var calculatePrice = require('./api/calculatePrice');
var materials = require('./api/materials');

var securedRoute = require('./api/securedRoute');

router.use('/auth', apiAuth);
router.use('/projects', apiProjects);
router.use('/project', apiProject);
router.use('/snapshot', apiSnapshot);
router.use('/calculate', calculatePrice);
router.use('/materials', materials);

router.use('/securedRoute', securedRoute);

module.exports = router;
