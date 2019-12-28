var config = require('./config');
var User = require('./db/user');

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    JWTStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.JWT_SECRET,
    },
    async function(jwtPayload, done) {
        try {
            let user = await User.findOne(jwtPayload.key);
            return done(null, user);
        } catch (e) {
            return done(null, false);
        }
    }
));






passport.use(new LocalStrategy(
    (username, password, done) => {
        if(username === 'postgres' && password === 'password') {
            return done(null, {username: 'postgres'});
        } else {
            return done(null, false);
        }
    }
));


passport.serializeUser(function(user, done) {
    done(null, user.username);
});

passport.deserializeUser((username, done) => {
    done(null, {username: username});
});

// passport.use(new LocalStrategy(
//     function(username, password, done) {
//
//         console.log(username, password);
//
//
//         User.findOne({ username: username }, function (err, user) {
//             if (err) { return done(err); }
//             if (!user) {
//                 return done(null, false, { message: 'Incorrect username.' });
//             }
//             if (!user.validPassword(password)) {
//                 return done(null, false, { message: 'Incorrect password.' });
//             }
//             return done(null, user);
//         });
//     }
// ));
