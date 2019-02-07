const admin = require('./firebase/admin');

const User = require('../database/models/User');
const Session = require('../database/models/Session');
const Achievement = require('../database/models/Achievement');

const functions = require('../functions');

const getUser = uid => {
  if (!uid || uid.toString().length < 1) return null;
  return admin.auth().getUser(uid);
};

const isUserLoggedIn = async req => {
  const session = await getSession(req);
  return session !== null;
};

const adminGuard = async (req, res, next) => {
  if (!(await isUserLoggedIn(req))) {
    res.redirect('/user/login?next=' + req.baseUrl + req.path);
  } else {
    const session = await getSession(req);
    const user = await User.findOne({ uid: session.uid }).catch(err =>
      functions.handle(err, '/core/modules/authModule.js')
    );

    if (user && user.admin) next();
    else res.redirect('/');
  }
};

const teacherGuard = async (req, res, next) => {
  if (!(await isUserLoggedIn(req))) res.redirect('/user/login');

  const session = await getSession(req);
  const user = await User.findOne({ uid: session.uid }).catch(err =>
    functions.handle(err, '/core/modules/authModule.js')
  );

  if (user && user.teacher) next();
  else res.redirect('/');
};

const loginGuard = async (req, res, next) => {
  if (!isUserLoggedIn(req)) res.redirect('/user/login');
  next();
};

const isUserAdmin = async req => {
  const session = (await getSession(req)) || {};

  const data = await User.find({ uid: session.uid })
    .then(data => data)
    .catch(err => functions.handle(err, '/core/modules/authModule.js'));

  return data[0] && data[0].admin;
};

const getSession = async req => {
  const { _sid } = req.cookies;

  const data = await Session.find({ id: _sid })
    .then(data => data)
    .catch(err => functions.handle(err, '/core/modules/authModule.js'));

  return data[0] || null;
};

const getLoggedUser = async req => {
  const session = await getSession(req);
  const { uid } = session || {};
  const user = await User.findOne({ uid });
  return user || {};
};

const loginStats = async user => {
  if (user == null || user.metadata == null) return;
  const now = new Date();
  let dateStr = `${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}`;
  dateStr = parseInt(dateStr);

  let hasVisited = false;
  let activity = user.metadata.activity;
  if (activity != null) {
    for (let entry of activity) {
      if (entry == dateStr) {
        hasVisited = true;
        break;
      }
    }
  } else {
    activity = [];
  }
  if (!hasVisited) {
    activity.push(dateStr);
    await User.updateOne(
      { uid: user.uid },
      {
        $set: {
          metadata: {
            activity
          }
        }
      }
    );
  }
};

const hasAchievement = async (user, id) => {
  if (user == null) return false;

  for (let achievement of user.achievements)
    if (achievement.id === id) return true;

  return false;
};

const grantAchievement = async (uid, id) => {
  if (uid == null) return;

  const user = await User.findOne({ uid });
  if (await hasAchievement(user, id)) return;
  const achievement = await Achievement.findOne({ id });
  if (achievement && achievement.published) {
    await user.achievements.push({
      id,
      timestamp: new Date(),
      title: achievement.title
    });
    await user.save().catch(err => handle(err, '/core/functions.js'));
  }
};

module.exports = {
  getUser,
  isUserLoggedIn,
  isUserAdmin,
  adminGuard,
  loginGuard,
  teacherGuard,

  getSession,
  getLoggedUser,
  loginStats,
  grantAchievement
};
