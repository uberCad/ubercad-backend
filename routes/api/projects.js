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
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
});

router.get('/:key', async function (req, res) {
    try {
        const { user } = req;
        const { key } = req.params;
        let project = await projectDb.get(key, user);
        res.json(project);
    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
});

module.exports = router;