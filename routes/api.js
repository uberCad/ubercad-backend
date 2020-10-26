const express = require('express');

const router = express.Router();
const apiAuth = require('./api/auth');
const apiUser = require('./api/user');
const apiProjects = require('./api/projects');
const apiProject = require('./api/project');
const apiSnapshot = require('./api/snapshot');
const calculatePrice = require('./api/calculatePrice');
const order = require('./api/order');
const materials = require('./api/materials');
const store = require('./api/store');
const securedRoute = require('./api/securedRoute');
const flixo = require('./api/flixo/router');

router.use('/auth', apiAuth);
router.use('/user', apiUser);
router.use('/projects', apiProjects);
router.use('/project', apiProject);
router.use('/snapshot', apiSnapshot);
router.use('/calculate', calculatePrice);
router.use('/order', order);
router.use('/materials', materials);
router.use('/securedRoute', securedRoute);
router.use('/store', store);
router.use('/flixo', flixo);

module.exports = router;
