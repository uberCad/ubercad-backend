var bcrypt = require('bcrypt-nodejs');

exports.comparePassword = function (passw1, passw2, callback) {
    bcrypt.compare(passw1, passw2, function (err, isMatch) {
        console.log(err, isMatch);

        if (err) {
            return callback(err);
        }
        callback(null, isMatch);
    });
};