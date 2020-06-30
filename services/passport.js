var config = require('./config');
var User = require('./db/user');

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
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

passport.use(new FacebookStrategy({
        clientID: config.FACEBOOK_APP_ID,
        clientSecret: config.FACEBOOK_APP_SECRET,
        callbackURL: "https://" + config.DOMAIN_API + "/api/auth/fb/auth2code"
    },
    async function(accessToken, refreshToken, profile, done) {
        try {
            console.log('accessToken', accessToken);
            console.log('refreshToken', refreshToken);
            console.log('profile', profile);
            let user = await User.findOrCreate(profile);
            return done(null, user);
        } catch (e) {
            return done(null, false);
        }
    }
));
