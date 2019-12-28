var express = require('express');
var router = express.Router();
var userDb = require('../../services/db/user');
var security = require('../../services/security');
var config = require('../../services/config');
var passport = require('passport');
var jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.json({
      resp: 'API users',
  });
});





router.get('/finduser/:username', async function(req, res) {
    try {
        // let user = await userDb.findUserByName(req.params.username);
        let user = await userDb.findUserByName('user2');
        // let user = await userDb.findOne(138598);
        res.json({
            user
        })
    } catch (e) {

        res.json(e.toString());
    }

    // if (!user) {
    //         res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    //     } else {
    //         // check if password matches
    //         user.comparePassword(req.body.password, function (err, isMatch) {
    //             if (isMatch && !err) {
    //                 // if user is found and password is right create a token
    //                 var token = jwt.sign(user.toJSON(), config.secret, {
    //                     expiresIn: 604800 // 1 week
    //                 });
    //                 // return the information including token as JSON
    //                 res.json({success: true, token: 'JWT ' + token});
    //             } else {
    //                 res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
    //             }
    //         });
    //     }



//     User.findOne({
//         username: req.body.username
//     }, function(err, user) {
//         if (err) throw err;
//
//         if (!user) {
//             res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
//         } else {
//             // check if password matches
//             user.comparePassword(req.body.password, function (err, isMatch) {
//                 if (isMatch && !err) {
//                     // if user is found and password is right create a token
//                     var token = jwt.sign(user.toJSON(), config.secret, {
//                         expiresIn: 604800 // 1 week
//                     });
//                     // return the information including token as JSON
//                     res.json({success: true, token: 'JWT ' + token});
//                 } else {
//                     res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
//                 }
//             });
//         }
//     });
});

router.post('/signup', async function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    } else {
        try {
            let user = await userDb.addUser({
                username: req.body.username,
                password: req.body.password
            });
            //todo try to auth right now
            res.json({success: true, msg: 'Successful created new user.'});
        } catch (e) {
            console.log(e);
            res.status(401).send({success: false, msg: 'Some error occurred.'});
        }
    }
});


router.post('/signin', function(req, res) {
    userDb.findUserByName(req.body.username).then(user => {
        // check if password matches
        security.comparePassword(req.body.password, user.password, function (err, isMatch) {
            if (isMatch && !err) {
                // if user is found and password is right create a token
                var token = jwt.sign({
                    key: user._key,
                    username: user.username,
                }, config.JWT_SECRET, {
                    expiresIn: "604800000" // 1 week
                });
                // return the information including token as JSON
                res.json({success: true, token});
            } else {
                res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
            }
        });
    }).catch(e => {
        console.log(e);
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    });
});


router.get('/signout', passport.authenticate('jwt', { session: false}), function(req, res) {
    req.logout();
    res.json({success: true, msg: 'Sign out successfully.'});
});


router.get('/testJWT', passport.authenticate('jwt', { session: false}), function(req, res) {
    return res.json({success: true, msg: 'Auth ok!.', user: req.user});
});

module.exports = router;
