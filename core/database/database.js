const mongoose = require('mongoose');

const User = require('./models/User');

const url =
  (process.env.DEV_DB_URL || 'mongodb://upt:uptupt@127.0.0.1:27017/') + 'upt';

mongoose.connect(
  url,
  { useNewUrlParser: true }
);
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB error:'));

module.exports = {
  url,
  db
};
