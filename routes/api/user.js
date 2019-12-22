var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.json({
      resp: 'API users',
  });
});


router.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/user',
        successRedirect: '/user/dashboard'
    })
);

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


module.exports = router;
