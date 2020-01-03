var express = require('express');
var router = express.Router();
var passport = require('passport');
var projectDb = require('../../services/db/project');

router.use(passport.authenticate('jwt', { session: false}));

router.get('/list/:filter', async function (req, res) {
    try {
        const { user } = req;
        const { filter } = req.params;
        let projects = await projectDb.list(user, filter);
        res.json(projects);
    } catch (e) {
        res.status(404).send({msg: 'The entry does not exist'});
    }
});

router.get('/:key', async function (req, res) {
    try {
        const { user } = req;
        const { key } = req.params;
        let project = await projectDb.get(key, user);
        if (!project) {
            throw new Error("Not found");
        }
        res.json(project);
    } catch (e) {
        res.status(404).send({msg: 'The entry does not exist'});
    }
});

module.exports = router;