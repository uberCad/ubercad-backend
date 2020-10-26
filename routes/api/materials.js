const router = require('express').Router();
const passport = require('passport');
const Material = require('../../services/db/material');

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', (req, res, next) => {
  Material
    .findAllMaterial()
    .then((data) => res.json(data))
    .catch(next);
});

module.exports = router;
