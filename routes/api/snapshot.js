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

router.post('/add/:projectKey', async function (req, res) {
    try {
        const { user } = req;
        const { projectKey } = req.params;
        let snapshot = await snapshotDb.add(projectKey, user, {
            title: req.body.title,
            createdBy: user._key,
            createdAt: Date.now(),
            layers: req.body.layers
        }, req.body.objects);

        if (!snapshot) {
            //It means that snapshot with same name in this project was created, so new snapshot now inserted to DB due conflict
            return res.status(400).send({msg: "Snapshot with same title already exists"});
        }
        res.json(snapshot);
    } catch (e) {
        res.status(400).send({msg: 'Something went wrong'});
    }
});

module.exports = router;

