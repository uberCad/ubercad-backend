var express = require('express');

var router = express.Router();
var passport = require('passport');

router.use(passport.authenticate('jwt', { session: false }));

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.json({
    resp: 'API secured route'
  });
});

router.get('/testJWT', (req, res) => res.json({ success: true, msg: 'Auth ok!.', user: req.user }));

module.exports = router;
