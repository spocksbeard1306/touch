var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy = require('passport-local').Strategy;
// var TwitterStrategy = require('passport-twitter').Strategy;
var models = require('./models');

var facebook = require('../env').facebook;

var errorLogin = { message: 'Usuario y/o clave no son válidos' };

module.exports = function(server) {
  server.use(passport.initialize());
  server.use(passport.session());

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });

  passport.use(new LocalStrategy(
    function(username, password, done) {
      models.User
        .find({
          where: {
            username: username,
          },
          attributes: ['id', 'password', 'name', 'email']
        })
        .then(function(user) {
          console.log('here')
          if (!user) {
            return done(errorLogin, false);
          }
          models.comparePassword(
            {
              password: user.password,
              candidatePassword: password,
            },
            function(err, isMatch) {
              if (err || !isMatch) return done(errorLogin, false);

              return done(null, {
                id: user.id,
                name: user.name,
                email: user.email
              });
            });
        })
        .catch(function(err) {
          return done({message: 'Ocurrio un error.Intente nuevamente'}, false);
        });
    }
  ));

  server.post('/login', function(req, res) {
    passport.authenticate('local', function(err, user) {
      console.log('catch', err, user);
      if (err) {
        console.log('error');
        req.flash('error', err.message);
        return res.redirect('back');
      }
      req.logIn(user, function(err) {
        if (err) {
          req.flash('error', 'Intente nuevamente.');
          return res.redirect('back');
        }
        console.log(req.session.lastUrl);
        var nextUrl = req.session.lastUrl || '/';
        console.log(nextUrl);
        return res.redirect(nextUrl);
      });
    })(req, res);
  });

  passport.use(new FacebookStrategy(
    {
      clientID: facebook.clientID,
      clientSecret: facebook.clientSecret,
      callbackURL: "/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'email', 'photos']
    },
    function(accessToken, refreshToken, profile, done) {
      var defaults = {
        provider: profile.provider,
        name: profile.displayName,
        email: profile.emails[0].value
      };

      models.User
        .findOrCreate({
          where: {providerId: profile.id},
          defaults: defaults
        }).spread(function (user, created) {
          return done(null, {
            id: user.id,
            name: user.name,
            email: user.email
          });
        })
        .catch(function (err) {
          console.log('login fb error', err);
          return done(err);
        });
    }
  ));

  server.get('/auth/facebook',
             passport.authenticate('facebook'));
  server.get(
    '/auth/facebook/callback',
    function (req, res) {
      passport.authenticate('facebook', function (err, user) {
        if (err) return res.redirect('back');
        req.logIn(user, function(err) {
          if (err) return res.redirect('back');
          var nextUrl = req.session.lastUrl || '/';
          return res.redirect(nextUrl);
        })
      })(req, res);
    }
  );

  server.get('/logout', function (req, res) {
    var nextUrl = req.session.lastUrl;
    req.session.destroy();
    req.logout();
    res.redirect(nextUrl);
  });

};
