const admin = require('./firebase/admin');

const User = require('../database/models/User');

function getUser(uid) {
  if (!uid || uid.toString().length < 1) return null;
  return admin.auth().getUser(uid);
}

function isUserLoggedIn(req) {
  const cookies = req.cookies;
  return cookies['logged_in'] && cookies['uid'];
}

async function isUserAdmin(req, res, next) {
  if (!isUserLoggedIn(req)) return false;
  const { uid } = req.cookies;
  const users = await User.find({ uid }, (err, data) => data);
  if (users[0] && users[0].admin) next();
  else res.redirect('/');
}

module.exports = {
  getUser,
  isUserLoggedIn,
  isUserAdmin
};
