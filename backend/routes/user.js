var async = require('async');
var crypto = require('crypto');

var User = require('../models/index').User;
var email = require('../../src/email');

var checkEmail = function(username, cb) {
  User.find({ where: {username: username }})
    .then(cb)
    .catch(cb);
};

module.exports = function (server) {
  server.get('/forgot', function (req, res) {
    res.render('forgot', {
      error: req.flash('error'),
      message: req.flash('message')
    });
  });

  server.post('/forgot', function (req, res) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function (token, done) {
        User.find({ where: {username: req.body.email}})
          .then(function (user) {
            if (!user) {
              return done('email no registrado');
            }

            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 360000;
            user.save()
              .then(function () {
                return done(null, token, user);
              });
          });
      },
      function (token, user, done) {
        var mailOptions = {
          url: req.headers.host + '/reset/' + token,
          email: req.body.email
        };
        email.sendResetPassword(mailOptions, function(err) {
          if (err) {
            return done(err);
          }
          return done(null);
        });
      }
    ], function (err) {
      if (err) {
        req.flash('error', err);
      } else {
        req.flash('message', 'Email enviado. Revise su bandeja.');
      }
      return res.redirect('back');
    });
  });

  server.post('/signup', function (req, res) {
    checkEmail(req.body.username, function(userFound) {
      if (userFound) {
        return res.send({ error: 'Email ya fue utilizado.', field: 'username'})
      }
      var newUser = {
        email: req.body.username,
        username: req.body.username,
        password: req.body.password,
        name: req.body.firstName + ' ' + req.body.lastName
      };
      User.create(newUser)
        .then(function() {
          req.logIn(newUser, function(err) {
            if (err) return res.send({ error: 'some error'});
            return res.send({ msg: 'OK' });
          });
        });
    });
  });

  server.post('/reset/:token', function (req, res) {
    async.waterfall([
      function(done) {
        User.findOne({where : {resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } } })
          .then(function(user) {
            if (!user) {
              req.flash('error', 'El token es inválido o ha vencido.');
                return done('');
            }

            user.password = req.body.password;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;

            user.save()
              .then(function(err) {
                req.logIn(user, function(err) {
                  return done(err, user);
                });
              })
              .catch(done);

          })
          .catch(function (err) {
            return done(err);
          });
      },
      function(user, done) {
        done(null);
      }
    ], function(err) {
      if (err) return res.redirect('back');
      req.flash('message', 'Contraseña modificada');
      return res.redirect('back');
    });
  });

  server.get('/reset/:token', function (req, res) {
    User.findOne(
      { resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
      .then(function(user) {
        if (!user) {
          req.flash('error', 'El token es inválido o ha vencido.');
        return res.redirect('/forgot');
      }
        return res.render(
          'resetPassword',
          {
            message: req.flash('message'),
            error: req.flash('error'),
          });
    });
  });

};
