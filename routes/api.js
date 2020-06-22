let express = require('express');
let router = express.Router();
let apiAuth = require('./api/auth');
let apiUser = require('./api/user');
let apiProjects = require('./api/projects');
let apiProject = require('./api/project');
let apiSnapshot = require('./api/snapshot');
let calculatePrice = require('./api/calculatePrice');
let materials = require('./api/materials');
let store = require('./api/store');
let securedRoute = require('./api/securedRoute');

router.use('/auth', apiAuth);
router.use('/user', apiUser);
router.use('/projects', apiProjects);
router.use('/project', apiProject);
router.use('/snapshot', apiSnapshot);
router.use('/calculate', calculatePrice);
router.use('/materials', materials);
router.use('/securedRoute', securedRoute);
router.use('/store', store);

module.exports = router;
