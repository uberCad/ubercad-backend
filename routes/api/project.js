var express = require('express');
var router = express.Router();
var passport = require('passport');
var projectDb = require('../../services/db/project');

router.use(passport.authenticate('jwt', { session: false}));

router.get('/file/:key', async function (req, res) {
    try {
        const { user } = req;
        const { key } = req.params;
        let file = await projectDb.file(key, user);
        if (!file) {
            throw new Error("Not found");
        }
        res.json(file);
    } catch (e) {
        res.status(404).send({msg: 'The entry does not exist'});
    }
});

router.get('/snapshot/:key', async function (req, res) {
    try {
        const { user } = req;
        const { key } = req.params;
        let snapshot = await projectDb.snapshot(key, user);
        if (!snapshot) {
            throw new Error("Not found");
        }
        res.json(snapshot);
    } catch (e) {
        res.status(404).send({msg: 'The entry does not exist'});
    }
});




module.exports = router;

