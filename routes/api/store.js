const router = require('express').Router();
const passport = require('passport');
const storeDb = require('../../services/db/store');

router.use(passport.authenticate('jwt', { session: false }));

router.get('/category/all', (req, res, next) => {
  storeDb
    .getCategoriesAll(req.user)
    .then((categories) => {
      if (!categories) {
        throw new Error('Not found');
      }
      res.json(categories);
    })
    .catch(next);
});

router.get('/category/:key', (req, res, next) => {
  storeDb
    .getCategories(req.user, req.params.key)
    .then((categories) => {
      if (!categories) {
        throw new Error('Not found');
      }
      res.json(categories);
    })
    .catch(next);
});

router.post('/part', (req, res, next) => {
  storeDb
    .add(req.body, req.user)
    .then((partKey) => res.json({ _key: partKey }))
    .catch(next);
});

router.get('/part/:key?', (req, res, next) => {
  storeDb
    .get(req.user, req.key)
    .then((part) => {
      if (!part) {
        throw new Error('Not found');
      }
      res.json(part);
    })
    .catch(next);
});

module.exports = router;
