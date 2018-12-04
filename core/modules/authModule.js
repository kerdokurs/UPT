const admin = require('./firebase/admin');

const User = require('../database/models/User');
const Session = require('../database/models/Session');

const functions = require('../functions');

function getUser(uid) {
  if (!uid || uid.toString().length < 1) return null;
  return admin.auth().getUser(uid);
}

async function isUserLoggedIn(req) {
  const session = await getSession(req);
  return session !== null;
}

async function adminGuard(req, res, next) {
  if (!(await isUserLoggedIn(req))) res.redirect('/user/login');

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

  return data[0] || null;
}

async function getLoggedUser(req) {
  const session = await getSession(req);
  const { uid } = session;
  const user = await User.find({ uid });
  return user[0] || null;
}

module.exports = {
  getUser,
  isUserLoggedIn,
  isUserAdmin,
  adminGuard,
  loginGuard,

  getSession,
  getLoggedUser
};
