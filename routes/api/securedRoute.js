var express = require('express');
var router = express.Router();
var passport = require('passport');

router.use(passport.authenticate('jwt', { session: false}));

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.json({
      resp: 'API secured route',
  });
});


router.get('/testJWT', function(req, res) {
    return res.json({success: true, msg: 'Auth ok!.', user: req.user});
});

module.exports = router;
