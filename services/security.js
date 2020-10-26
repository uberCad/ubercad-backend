var bcrypt = require('bcrypt-nodejs');

exports.comparePassword = function (passw1, passw2, callback) {
  bcrypt.compare(passw1, passw2, (err, isMatch) => {
    console.log(err, isMatch);

    if (err) {
      return callback(err);
    }
    callback(null, isMatch);
  });
};

exports.generateHash = function (password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, null, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};
