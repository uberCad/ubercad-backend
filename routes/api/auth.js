var express = require('express');

var router = express.Router();
var passport = require('passport');
var jwt = require('jsonwebtoken');
var userDb = require('../../services/db/user');
var security = require('../../services/security');
var config = require('../../services/config');

router.get('/', (req, res, next) => {
  res.json({
    resp: 'API users'
  });
});

router.post('/signup', async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.json({ success: false, msg: 'Please pass username and password.' });
  }
  else {
    try {
      const user = await userDb.addUser({
        username: req.body.username,
        password: req.body.password,
        type: 'login'
      });
      // todo try to auth right now
      res.json({ success: true, msg: 'Successful created new user.' });
    }
    catch (e) {
      console.log(e);
      res.status(401).send({ success: false, msg: 'Some error occurred.' });
    }
  }
});

router.post('/login', (req, res) => {
  userDb.findUserByName(req.body.username).then((user) => {
    // check if password matches
    security.comparePassword(req.body.password, user.password, (err, isMatch) => {
      if (isMatch && !err) {
        // if user is found and password is right create a token
        var token = jwt.sign({
          key: user._key,
          username: user.username
        }, config.JWT_SECRET, {
          expiresIn: '604800000' // 1 week
        });

        const { username } = user;
        // return the information including token as JSON
        res.json({
          token,
          username,
          pictureUrl: 'https://avatars3.githubusercontent.com/u/42713614?s=200&v=4'
        });
      }
      else {
        res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
      }
    });
  }).catch((e) => {
    console.log(e);
    res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
  });
});

router.get('/facebook', passport.authenticate('facebook'));

router.get('/fb/auth2code',
  passport.authenticate('facebook', {
    // successRedirect: `//${config.DOMAIN_CLIENT}/`,
    failureRedirect: `//${config.DOMAIN_CLIENT}/login`
  }), (req, res) => {
    const { user } = req;

    const token = jwt.sign({
      key: user._key,
      username: user.username
    }, config.JWT_SECRET, {
      expiresIn: '604800000' // 1 week
    });
    // ${JSON.stringify(user)}
    const { username } = user;
    const redirectUrl = `//${config.DOMAIN_CLIENT}/login/${username}/${token}`;
    res.send(`<!DOCTYPE html><html><head>
            <meta http-equiv="Refresh" content="0; url='${redirectUrl}'" />
        </head>            
        <body>
            redirecting...
            <script>
                localStorage.setItem('token', '${`Bearer ${token}`}');
                location.href = '${redirectUrl}';
            </script>
        </body>
        </html>`);
  });

router.post('/logout', (req, res) => {
  req.logout();
  res.json({ success: true, msg: 'Sign out successfully.' });
});

router.get('/testJWT', passport.authenticate('jwt', { session: false }), (req, res) => res.json({ success: true, msg: 'Auth ok!.', user: req.user }));

module.exports = router;
