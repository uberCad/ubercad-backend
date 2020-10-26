const express = require('express');

const router = express.Router();
const passport = require('passport');
const storeDb = require('../../services/db/store');
const User = require('../../services/db/user');

router.use(passport.authenticate('jwt', { session: false }));

router.get('/category/all', async (req, res) => {
  try {
    const { user } = req;
    const categories = await storeDb.getCategoriesAll(user);
    if (!categories) {
      throw new Error('Not found');
    }
    res.json(categories);
  }
  catch (e) {
    res.status(404).send({ msg: 'The entry does not exist', e });
  }
});

router.get('/category/:key', async (req, res) => {
  try {
    const { user } = req;
    const { key } = req.params;
    const categories = await storeDb.getCategories(user, key);
    if (!categories) {
      throw new Error('Not found');
    }
    res.json(categories);
  }
  catch (e) {
    res.status(404).send({ msg: 'The entry does not exist', e });
  }
});

router.post('/part', async (req, res) => {
  try {
    const { user } = req;
    const partKey = await storeDb.add(req.body, user);
    res.json({ _key: partKey });
  }
  catch (e) {
    res.status(404).send({ msg: 'The entry does not exist', e });
  }
});

router.get('/part/:key?', async (req, res) => {
  try {
    const { user } = req;
    const { key } = req.params;

    const part = await storeDb.get(user, key);
    if (!part) {
      throw new Error('Not found');
    }
    res.json(part);
  }
  catch (e) {
    res.status(404).send({ msg: 'The entry does not exist', e });
  }
});

module.exports = router;
