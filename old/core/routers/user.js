'use strict';

const router = require('express').Router();

const admin = require('../modules/firebase/admin');
const authModule = require('../modules/authModule');
const functions = require('../functions');

const User = require('../database/models/User');
const Bookmark = require('../database/models/Bookmark');
const Session = require('../database/models/Session');
const Achievement = require('../database/models/Achievement');

const ExerciseRevision = require('../database/models/ExerciseRevision');
const SolvedExercise = require('../database/models/SolvedExercise');

router.route('/login').get(async (req, res) => {
  if (await authModule.isUserLoggedIn(req)) res.redirect('/user');
  else {
    res.render('user/login');
  }
});

router.route('/logout').get(async (req, res) => {
  const session = (await authModule.getSession(req)) || {};
  await Session.deleteOne({ id: session.id }).catch(err =>
    functions.handle(err, '/core/routers/user.js')
  );
  res
    .cookie('logged_in', '', { expires: new Date() })
    .cookie('_sid', '', { expires: new Date() })
    .render('user/logout');
});

router.route('/post-login').get(async (req, res) => {
  const { uid } = req.query;
  if (uid) {
    const users = await User.find({ uid }).catch(err =>
      functions.handle(err, '/core/routers/user.js')
    );

    let expires = new Date();
    expires.setDate(expires.getDate() + 30);

    const sid = functions.randomString(24);

    if (users.length > 0) {
      const user = users[0];
      const { uid } = user;

      await Session.create({ id: sid, uid, created_at: new Date() }).catch(
        err => functions.handle(err, '/core/routers/user.js')
      );

      User.updateOne({ uid }, { $set: { last_sign_in: new Date() } })
        .then(() => {
          res
            .cookie('logged_in', true, { expires })
            .cookie('_sid', sid, { expires })
            .redirect(req.redir);
        })
        .catch(err => functions.handle(err, '/core/routers/user.js'));
    } else {
      const user = await admin
        .auth()
        .getUser(uid)
        .then(data => data)
        .catch(err => functions.handle(err, '/core/routers/user.js'));

      const { email, displayName, photoURL } = user;

      await Session.create({
        id: sid,
        uid,
        created_at: new Date()
      }).catch(err => functions.handle(err, '/core/routers/user.js'));

      User.create({
        uid,
        displayName,
        photoURL,
        email,
        sign_up: new Date(),
        last_sign_in: new Date(),
        admin: false,
        metadata: {
          activity: [],
          solved_exercises: 0,
          exercise_points: 0
        }
      })
        .then(async () => {
          await authModule.grantAchievement(uid, 'login');
          res
            .cookie('logged_in', true, { expires })
            .cookie('_sid', sid, { expires })
            .redirect(req.redir);
        })
        .catch(err => functions.handle(err, '/core/routers/user.js'));
    }
  }
});

router.use(authModule.loginGuard);

router.route('/').get(async (req, res) => {
  const session = (await authModule.getSession(req)) || {};
  let user = await User.findOne({ uid: session.uid }).catch(err =>
    functions.handle(err, '/core/routers/user.js')
  );

  res.render('user/user', { data: user });
});

router.route('/settings').get(async (req, res) => {
  const data = await authModule.getLoggedUser(req);
  res.render('user/settings', { data });
});

router.route('/settings/toggle_allow_leaderboard').get(async (req, res) => {
  const { uid } = await authModule.getSession(req);
  const data = await User.findOne({ uid });
  await User.updateOne(
    { uid },
    {
      $set: {
        allow_leaderboard: !data.allow_leaderboard
      }
    }
  );

  res.redirect('/user/settings/');
});

router.route('/achievements').get(async (req, res) => {
  if (!(await authModule.isUserLoggedIn(req))) res.redirect('/user/login');
  const user = await authModule.getLoggedUser(req);
  const achievements = user.achievements;

  const _achievements = [];
  for (let achievement of achievements) {
    const _achievement = await Achievement.find({ id: achievement.id });

    _achievements.push({
      timestamp: achievement.timestamp,
      title: _achievement[0].title,
      description: _achievement[0].description
    });
  }

  res.render('user/achievements', {
    achievements: _achievements
  });
});

router.route('/bookmarks').get(async (req, res) => {
  if (!(await authModule.isUserLoggedIn(req))) res.redirect('/user/login');
  const session = await authModule.getSession(req);
  const bookmarks = await Bookmark.find({ uid: session.uid }).catch(err =>
    functions.handle(err, '/core/routers/user.js')
  );
  res.render('user/bookmarks', { bookmarks });
});

router.route('/delete').get(async (req, res) => {
  res.render('user/delete');
});

router.route('/delete').post(async (req, res) => {
  const { uid } = await authModule.getLoggedUser(req);

  await Promise.all([
    Bookmark.deleteMany({ uid }),
    ExerciseRevision.deleteMany({ uid }),
    Session.deleteMany({ uid }),
    SolvedExercise.deleteMany({ uid }),
    User.deleteOne({ uid })
  ]).catch(err => functions.handler(err, '/core/routers/user.js'));

  res
    .cookie('logged_in', '', { expires: new Date() })
    .cookie('_sid', '', { expires: new Date() })
    .redirect(req.redir);
});

module.exports = router;
