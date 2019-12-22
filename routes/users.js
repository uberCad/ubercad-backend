var express = require('express');
var router = express.Router();
var passport = require('passport');


/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log('user/get');
    res.render('user/login', { title: 'Login page' });
});

router.post('/',
    passport.authenticate('local', {
      failureRedirect: '/user',
      successRedirect: '/user/dashboard'
    })
);

function isLoggedIn(req ,res, next) {
    console.log('isLoggedIn?');

    if (req.isAuthenticated()) {
        console.log('isLoggedIn TRUE');
        return next();
    } else {
        console.log('isLoggedIn FALSE');
        return res.redirect('/user');
    }
}

router.get('/dashboard', isLoggedIn, (req, res) => {
    // res.render('dashboard');
    res.json({
        resp: 'dashboard',
        isAuthenticated: req.isAuthenticated()
    });
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/user');
});

module.exports = router;
