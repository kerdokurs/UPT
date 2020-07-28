const admin = require('./firebase/admin');

const getUser = uid => {
  if (!uid || uid.toString().length < 1) return null;
  return admin.auth().getUser(uid);
};

const isUserLoggedIn = async req => {
  const user = req.session.user;
  return user != null;
};

module.exports = {
  getUser,
  isUserLoggedIn
};
