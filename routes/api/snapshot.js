var express = require('express');
var router = express.Router();
var passport = require('passport');
var snapshotDb = require('../../services/db/snapshot');

router.use(passport.authenticate('jwt', { session: false}));

router.get('/:key', async function (req, res) {
    try {
        const { user } = req;
        const { key } = req.params;
        let snapshot = await snapshotDb.get(key, user);
        if (!snapshot) {
            throw new Error("Not found");
        }
        res.json(snapshot);
    } catch (e) {
        res.status(404).send({msg: 'The entry does not exist'});
    }
});

module.exports = router;

