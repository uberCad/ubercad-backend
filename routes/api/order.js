const router = require('express').Router();
const passport = require('passport');

const security = require('../../services/security');
const Order = require('../../services/db/order');

router.use(passport.authenticate('jwt', { session: false }));

/**
 * POST /order
 */
router.post('/', async (req, res, next) => {
  const hash = await security.generateHash(`${req.user._key} order ${(new Date()).getTime()}`);
  Order
    .add({
      createdBy: req.user._key,
      createdAt: Date.now(),
      contactInformation: req.body.contactInformation,
      order: req.body.order,
      orderObjects: req.body.orderObjects,
      hash
    }, req.user)
    .then((orderKey) => res.json({
      message: 'Your order is accepted. Thank you.',
      link: `order/${orderKey}/${hash}`
    }))
    .catch(next);
});

router.get('/:key/:hash(*)', (req, res, next) => {
  Order
    .get(req.user, req.params.key, req.params.hash)
    .then((order) => {
      if (!order) {
        throw new Error('Not found');
      }
      res.json(order);
    })
    .catch(next);
});

module.exports = router;
