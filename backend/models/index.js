"use strict";

var bcrypt = require('bcrypt-nodejs');
var Sequelize = require('sequelize');

var db = require('../../env').database;

var sequelize = new Sequelize(db.name, db.user, db.password, db.options);

var User = sequelize.define('user', {
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  provider: Sequelize.STRING,
  providerId: Sequelize.STRING,
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  resetPasswordToken: Sequelize.STRING,
  resetPasswordExpires: Sequelize.DATE
});

var hashPassword = function (user, options, next) {
  var SALT_FACTOR = 5;

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, null, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      return next();
    });
  });
};

User.beforeCreate(hashPassword);
User.beforeUpdate(hashPassword);

var comparePassword = function(pw, cb) {
  bcrypt.compare(pw.candidatePassword, pw.password,
    function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
    }
  );
};

var Order = sequelize.define('order', {
  data: Sequelize.STRING(500),
  image: Sequelize.STRING
});

Order.belongsTo(User);

var Temp = sequelize.define('temp', {
  data: Sequelize.TEXT('medium')
});

// User.create({username: 'testerino', password: 'asdf'}).then(function() {console.log('ok')});

module.exports = {
  sequelize: sequelize,
  Sequelize: Sequelize,
  User: User,
  Order: Order,
  Temp: Temp,
  comparePassword: comparePassword,
};
