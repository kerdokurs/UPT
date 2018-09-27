const admin = require('./firebase/admin');

function getUser(uid) {
  if (!uid || uid.toString().length < 1) return null;
  return admin.auth().getUser(uid);
}

function isUserLoggedIn(req) {
  const cookies = req.cookies;
  return cookies['uid'] && cookies['authUid'];
}

module.exports = {
  getUser,
  isUserLoggedIn
};
