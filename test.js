var Sequelize = require('sequelize');

var sequelize = new Sequelize('touch', 'root', 'reporelteam', {
  host: 'localhost',
  dialect: 'mysql',
});

var User = sequelize.define('user', {
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  provider: Sequelize.STRING,
  providerId: Sequelize.STRING,
  username: Sequelize.STRING,
  password: Sequelize.STRING
});

var Order = sequelize.define('order', {
  data: Sequelize.STRING(500),
  image: Sequelize.STRING
});

Order.belongsTo(User);

User.sync({ force: true }).then(function() {
  // Order.sync({ force: true });
});
