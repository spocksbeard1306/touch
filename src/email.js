var nodemailer = require('nodemailer');
var _ = require('lodash');

var env = require('../env');

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: env.email.user,
    pass: env.email.pass
  }
});

var sendEmail = function (params ,cb) {
  params.from = env.email.from;
  params.to = env.email.to;
  transporter.sendMail(params, cb);
};

var sendResetPassword = function (data, cb) {
  var compiled = _.template(
    'Para realizar el cambio de tu contraseña ingrese a la siguiente' +
      ' url <a href="http://<%= url %>">http://<%= url %></a>'
  );

  var mailOptions = {
    subject: 'Cambio de clave',
    html: compiled(data),
    from: env.email.from,
    to: data.email
  };

  transporter.sendMail(mailOptions, cb);
};

var sendPurchase = function (data, cb) {
  var compiled = _.template('<b>pedido</b> <p> Tamanho <%= size %> | Forma <%= shape %>' +
        ' | material <%= material %> | frase <%= phrase %> | cantidad: <%= amount %>' +
        ' | address: <%= address %> | referencia <%= reference %>| email <%= email %>| nombre: <%= displayName %>' +
        ' <img src="cid:imgTest"/>');

  console.log(compiled(data));
  console.log(data.imgUrl);
  var mailOptions = {
    subject: 'Pedido ',
    html: compiled(data),
    attachments: [
      {
        // path: 'http://104.131.28.224:4000/public/demo.jpg',
        path: data.imgUrl,
        cid: 'imgTest'
      }
    ]
  };
  sendEmail(mailOptions, cb);
};

var sendContact = function (data, cb) {
  var mailOptions = {
    subject: 'Contact',
    html: 'asdfadf',
  };
  sendEmail(mailOptions, cb);
};

module.exports = sendPurchase;
sendPurchase.sendPurchase = sendPurchase;
sendPurchase.contact = sendContact;
sendPurchase.sendResetPassword = sendResetPassword;
