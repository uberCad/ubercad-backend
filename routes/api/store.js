let express = require('express');
let router = express.Router();
let passport = require('passport');
let storeDb = require('../../services/db/store');
let User = require('../../services/db/user');

router.use(passport.authenticate('jwt', { session: false}));

router.get('/category/all', async function (req, res) {
    try {
        const { user } = req;
        let categories = await storeDb.getCategoriesAll(user);
        if (!categories) {
            throw new Error("Not found");
        }
        res.json(categories);
    } catch (e) {
        res.status(404).send({msg: 'The entry does not exist', e});
    }
});

router.get('/category/:key', async function (req, res) {
    try {
        const { user } = req;
        const { key } = req.params;
        let categories = await storeDb.getCategories(user, key);
        if (!categories) {
            throw new Error("Not found");
        }
        res.json(categories);
    } catch (e) {
        res.status(404).send({msg: 'The entry does not exist', e});
    }
});

router.post('/part', async function (req, res) {
    try {
        const { user } = req;
        const {
            title,
            categoryKey,
            width,
            height,
            materialKey,
            object
        } = req.body;
        const partKey = await storeDb.add({
            title,
            categoryKey,
            width,
            height,
            materialKey,
            object
        }, user);
        res.json({_key: partKey});
    } catch (e) {
        res.status(404).send({msg: 'The entry does not exist', e});
    }
});

router.get('/part/:key?', async function (req, res) {
    try {
        const { user } = req;
        const { key } = req.params;

        let part = await storeDb.get(user, key);
        if (!part) {
            throw new Error("Not found");
        }
        res.json(part);
    } catch (e) {
        res.status(404).send({msg: 'The entry does not exist', e});
    }
});

module.exports = router;
