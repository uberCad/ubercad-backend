const express = require('express');

const router = express.Router();

/* GET home page. */
// Do we need that?
router.get('/', (req, res) => res.render('index', { title: 'Express' }));

module.exports = router;
