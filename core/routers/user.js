'use strict';

const router = require('express').Router();

const admin = require('../modules/firebase/admin');
const authModule = require('../modules/authModule');
const functions = require('../functions');

require('../database/database');
const User = require('../database/models/User');
const Bookmark = require('../database/models/Bookmark');
const Session = require('../database/models/Session');

router.route('/login').get(async (req, res) => {
  if (authModule.isUserLoggedIn(req)) res.redirect('/user');
  else {
    res.render('user/login');
  }
});

router.route('/logout').get(async (req, res) => {
  const session = (await authModule.getSession(req)) || {};
  await Session.deleteOne({ id: session.id }, err => {});
  res
    .cookie('logged_in', '', { expires: new Date() })
    .cookie('_sid', '', { expires: new Date() })
    .render('user/logout');
});

router.route('/post-login').get(async (req, res) => {
  const { uid } = req.query;
  if (uid) {
    const users = await User.find({ uid }, (err, data) => data);

    let expires = new Date();
    expires.setDate(expires.getDate() + 30);

    const sid = functions.randomString(24);

    if (users.length > 0) {
      const user = users[0];
      const { uid } = user;

      await Session.create({ id: sid, uid, created_at: new Date() }, err => {});

      User.updateOne({ uid }, { $set: { last_sign_in: new Date() } }, () => {
        res
          .cookie('logged_in', true, { expires })
          .cookie('_sid', sid, { expires })
          .redirect('/');
      });
    } else {
      const user = await admin
        .auth()
        .getUser(uid)
        .then(data => data);

      const { email, displayName, photoURL } = user;

      await Session.create(
        {
          id: sid,
          uid,
          created_at: new Date()
        },
        err => {}
      );

      User.create(
        {
          uid,
          displayName,
          photoURL,
          email,
          sign_up: new Date(),
          last_sign_in: new Date(),
          admin: false
        },
        () => {
          res
            .cookie('logged_in', true, { expires })
            .cookie('_sid', sid, { expires })
            .redirect('/');
        }
      );
    }
  }
});

router.use(authModule.loginGuard);

router.route('/').get(async (req, res) => {
  const session = (await authModule.getSession(req)) || {};
  const users = await User.find({ uid: session.uid }).then(data => data);

  res.render('user/user', { data: users[0] });
});

router.route('/achievements').get(async (req, res) => {
  const achievements = [];
  res.render('user/achievements', { achievements });
});

router.route('/bookmarks').get(async (req, res) => {
  const session = await authModule.getSession(req);
  const bookmarks = await Bookmark.find({ uid: session.uid }, data => data);
  res.render('user/bookmarks', { bookmarks });
});

module.exports = router;
