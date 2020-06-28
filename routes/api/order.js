const express = require('express');
const router = express.Router();
let passport = require('passport');

let security = require('../../services/security');
let orderDb = require('../../services/db/order');

router.use(passport.authenticate('jwt', { session: false}));

/**
 * POST /order
 */
router.post('/', async function (req, res, next) {
    try {
        const { user } = req;
        console.log(user);
        const hash = await security.generateHash(`${user._key} order ${(new Date()).getTime()}`);

        const orderKey = await orderDb.add({
                createdBy: user._key,
                createdAt: Date.now(),
                contactInformation: req.body.contactInformation,
                order: req.body.order,
                orderObjects: req.body.orderObjects,
                hash
        }, user);
        res.json({
            message: `Your order is accepted. Thank you.`,
            link: `order/${orderKey}/${hash}`
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/:key/:hash', async function (req, res) {
    try {
        const { user } = req;
        const { key, hash } = req.params;
        let order = await orderDb.get(user, key, hash);
        if (!order) {
            throw new Error("Not found");
        }
        res.json(order);
    } catch (e) {
        res.status(404).send({msg: 'The entry does not exist', e});
    }
});

module.exports = router;
