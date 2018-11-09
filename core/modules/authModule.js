const admin = require('./firebase/admin');

const User = require('../database/models/User');
const Session = require('../database/models/Session');

const functions = require('../functions');

function getUser(uid) {
  if (!uid || uid.toString().length < 1) return {};
  return admin.auth().getUser(uid);
}

function isUserLoggedIn(req) {
  const cookies = req.cookies;
  return cookies['logged_in'] && cookies['_sid'];
}

async function adminGuard(req, res, next) {
  if (!isUserLoggedIn(req)) res.redirect('/user/login');

  const session = await getSession(req);
  const users = await User.find({ uid: session.uid })
    .then(data => data)
    .catch(err => functions.handle(err, '/core/modules/authModule.js'));

  if (users[0] && users[0].admin) next();
  else res.redirect('/');
}

async function loginGuard(req, res, next) {
  if (!isUserLoggedIn(req)) res.redirect('/user/login');
  next();
}

async function isUserAdmin(req) {
  const session = (await getSession(req)) || {};

  const data = await User.find({ uid: session.uid })
    .then(data => data)
    .catch(err => functions.handle(err, '/core/modules/authModule.js'));

  return data[0] && data[0].admin;
}

async function getSession(req) {
  const { _sid } = req.cookies;

  const data = await Session.find({ id: _sid })
    .then(data => data)
    .catch(err => functions.handle(err, '/core/modules/authModule.js'));

  return data[0];
}

module.exports = {
  getUser,
  isUserLoggedIn,
  isUserAdmin,
  adminGuard,
  loginGuard,

  getSession
};
