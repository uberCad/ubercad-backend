const router = require('express').Router();
const passport = require('passport');

router.use(passport.authenticate('jwt', { session: false }));

router.get('/profile', (req, res) => {
  // try {
  res.json({
    user: {
      ...req.user,
      pictureUrl: 'https://avatars3.githubusercontent.com/u/42713614?s=200&v=4'
    }
  });
  // I don't think that will work fine
  // }
  // catch (e) {
  //   res.status(404).send({ msg: 'The entry does not exist' });
  // }
});

module.exports = router;
