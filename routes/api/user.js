var express = require('express');
var router = express.Router();
var passport = require('passport');
var userDb = require('../../services/db/user');

router.use(passport.authenticate('jwt', { session: false}));

router.get('/profile', async function (req, res) {
    try {
        const { user } = req;
        res.json({
            user: {
                ...user,
                pictureUrl: 'https://avatars3.githubusercontent.com/u/42713614?s=200&v=4'
            }
        });
    } catch (e) {
        res.status(404).send({msg: 'The entry does not exist'});
    }
});

module.exports = router;
