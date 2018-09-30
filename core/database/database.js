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

/* const getUser = async uid => {
  return new Promise((res, rej) => {
    User.find({ uid }, (err, users) => {
      if (err) rej({ status: 102, err });
      db.close();

      res({
        status: 200,
        data: users
      });
    });
  });
};

const saveUser = async user => {
  return new Promise((res, rej) => {
    User.create(user, (err, data) => {
      if (err) rej({ status: 102, data: err });
      if (data) rej({ status: 403, data: 'User already exists' });
      db.close();

      res({
        status: 200,
        message: 'Successfully saved!'
      });
    });
  });
};

const deleteUser = async uid => {
  return new Promise((res, rej) => {
    User.deleteOne({ uid }, (err, data) => {
      if (err) rej({ status: 102, data: err });
      if (!data) rej({ status: 404, data: "User doesn't exist" });
      db.close();

      res({
        status: 200,
        data
      });
    });
  });
};

const updateUser = async (uid, data, callback) => {
  User.updateOne({ uid }, { $set: data }, callback);
};

module.exports = {
  //User:
  getUser,
  saveUser,
  deleteUser,
  updateUser
};
 */
