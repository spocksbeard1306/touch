var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var _ = require('lodash');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var fs = require("fs");
var Jimp = require("jimp");


var models = require('./backend/models');
var setUpLogin = require('./backend/setUpLogin');
var email = require('./src/email');
var userRoute = require('./backend/routes/user');

var app = new express();
var port = 4000;

app.use(flash());
app.use(compress());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(session({
  secret: 'gg',
  resave: true,
  saveUnitialized: true
}));

app.set('view engine', 'jade');
app.set('views', path.join(__dirname + '/views'));
app.use('/public', express.static(__dirname + '/public'));

setUpLogin(app);
userRoute(app);

app.get('/customize', function (req, res) {
  req.session.lastUrl = '/customize';
  const tempId = req.session.tempId;
  req.session.tempId = null;
  if (tempId !== null && tempId !== undefined) {
    models.Temp.findOne({ where: { id: tempId } })
      .then(function (temp) {
        if (!temp) {
          return res.render('customize', { initialState: null, user: req.user });
        }
        return res.render('customize', { initialState: temp.data, user: req.user });
      })
      .catch(function (err) {
        res.render({ error : 'some error' });
      });
  } else {
    return res.render('customize', { initialState: null, user: req.user });
  }
});

app.get('/login', function (req, res) {
  res.render(
    'login',
    {
      message: req.flash('error'),
      user: req.user
    }
  );
});

app.post('/contact', function (req, res) {
  email.sendContact(req.body, function (error, info) {
    if (error) return res.send({ error: error });
    res.send({ msg: 'ok' });
  });
});

app.post('/tempSave', function (req, res) {
  models.Temp
    .create({
      data: JSON.stringify(req.body)
    })
    .then(function (row) {
      req.session.tempId = row.id;
      res.send({ msg: 'OK'});
    })
    .catch(function (err) {
      res.send({ error: err });
    });
});

var createImageGrayScale = function(data, cb) {
  data.baseName = data.baseName || '';
  var base64Data = data.imgSrc.split(',')[1];
  var fileName = 'gray' + new Date().getTime() + ".png";
  fs.writeFile("public/upload/" + fileName, base64Data, 'base64',
    function (err) {
      if (err) return cb(err);
      Jimp.read(
        'public/img/' + data.shape + 'Shape.png',
        function (err, backlenna) {
          if (err) return cb(err);

          Jimp.read('public/upload/'+fileName,
            function (err, lenna) {
              if (err) return cb(err);
              lenna
                .greyscale()
                .composite(backlenna, 0, 0)
                .write(
                  'public/upload/'+fileName,
                  function (err) {
                    return cb(err, fileName);
                  }
                );
            })
        }
      )
    }
  );
};

var createImage = function(data,  cb) {
  data.baseName = data.baseName || '';
  var base64Data = data.imgSrc.split(',')[1];
  var fileName = data.baseName + new Date().getTime() + ".png";
  fs.writeFile("public/upload/" + fileName, base64Data, 'base64',
               function (err) {
                 cb(err, fileName);
               });
};

app.post('/generateImage', function (req, res) {
  createImageGrayScale({ imgSrc: req.body.imgSrc, shape: req.body.shape}, function (err, fileName) {
    res.send({
      url: 'http://'+ req.headers.host + '/public/upload/' + fileName
    });
  });
});

app.post('/submit', function (req, res) {
  createImage({ imgSrc: req.body.imgSrc }, function (err, fileName) {
     if (err) {
      console.log('upload', err);
      return res.send({ error: err });
    }
    console.log('before gray');
    createImageGrayScale({imgSrc: req.body.imgSrc, shape: req.body.shape}, function (err, grayFileName) {
      if (err) {
        return res.send({ error: err });
      }
      console.log('here');

      var data = _.omit(req.body, ['imgSrc']);
      data.displayName = req.user.name;
      data.email = req.user.email;
      data.imgUrl = 'http://' + req.headers.host + '/public/upload/' + fileName;

      console.log('grey', '/public/upload/'+ grayFileName);
      models.Order.create({
        userId: req.user.id,
        data: JSON.stringify(data),
        image: '/public/upload/' + grayFileName
      }).then(function () {
        console.log('order saved');
        email.sendPurchase(data, function(error, info) {
          console.log('email', error, info);
          if (error) return res.send({ error: error });
          res.send({ msg: 'ok' });
        });
      });
    })

  });
});

app.get('/about', function (req, res) {
  res.render('about', { activeUrl: '/', user: req.user });
});

app.get('/', function (req, res) {
  res.render('home', { activeUrl: '/', user: req.user });
});

app.get('/galeria', function (req, res) {
  req.session.lastUrl = '/galeria';
  res.render('galeria', { activeUrl: '/galeria', user: req.user });
});

app.get('/personaliza', function (req, res) {
  req.session.lastUrl = '/personaliza';
  res.render('personaliza', {activeUrl: '/personaliza', user: req.user });
});

app.get('/galeria', function (req, res) {
  res.render('galeria');
});

app.get('/customize2', function (req, res) {
  res.render('customize2');
});

/*app.get('/customize', function (req, res) {
  res.render('customize');
});

app.get('/customize-step2', function (req, res) {
  res.render('customize-step2');
});

app.get('/customize-step3', function (req, res) {
  res.render('customize-step3');
});*/

app.get('/carrito', function (req, res) {
  models.Order.findAll({where: {userId: req.user.id}, raw: true })
    .then(function (orders) {
      orders = JSON.parse(JSON.stringify(orders));
      var formatOrders = [];
      for (var i = 0, len = orders.length; i < len; i++ ) {
        // console.log(JSON.parse(orders[i].data).size);
        formatOrders[i] = {
          image: orders[i].image,
          data: JSON.parse(orders[i].data)
        };
      }
      console.log(formatOrders);
      res.render('carrito', { orders: formatOrders, user: req.user });
    })
    .catch(function () {
      res.redirect('back');
    });
});

app.get('*', function (req, res) {
  res.redirect('/');
})

models.sequelize.sync().then(function() {
  app.listen(port, function(error) {
    if (error) {
      return console.log(error);
    }
    console.log("Listening on port %s", port);
  });
});

