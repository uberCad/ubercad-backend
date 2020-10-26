var express = require('express');

var router = express.Router();
var passport = require('passport');

/* GET users listing. */
// Delete? Why do we need that?
router.get('/', (req, res) => {
  res.render('user/login', { title: 'Login page' });
});

router.post('/',
  passport.authenticate('local', {
    failureRedirect: '/user',
    successRedirect: '/user/dashboard'
  }));

router.get(
  '/dashboard',
  (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/user');
  },
  (req, res) => {
    res.json({
      resp: 'dashboard',
      isAuthenticated: req.isAuthenticated()
    });
  }
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/user');
});

module.exports = router;
