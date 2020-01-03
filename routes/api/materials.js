var express = require('express');
var router = express.Router();
var passport = require('passport');
var materialDb = require('../../services/db/material');

router.use(passport.authenticate('jwt', { session: false}));

router.get('/', async function (req, res) {
    try {
        const materials = await materialDb.findAllMaterial();
        res.json(materials);
    } catch (e) {
        res.status(404).send({msg: 'The entry does not exist'});
    }
});

module.exports = router;
