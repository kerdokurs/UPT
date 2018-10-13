/**
 * @author Kerdo
 * Website https://ktch.tk/
 * Contact kerdo@ktch.tk
 * Copyright (c) Kerdo 2018
 */
'use strict';

const router = require('express').Router();

const admin = require('../modules/firebase/admin');
const auth = require('../modules/authModule');

require('../database/database');
const User = require('../database/models/User');
const Bookmark = require('../database/models/Bookmark');

router.route('/login').get(async (req, res) => {
  if (auth.isUserLoggedIn(req)) res.redirect('/user');
  else {
    res.render('user/login');
  }
});

router.route('/post-login').get(async (req, res) => {
  if (auth.isUserLoggedIn(req)) res.redirect('/');
  const { uid } = req.query;
  if (uid) {
    const users = await User.find({ uid }, (err, data) => data);

    let expires = new Date();
    expires.setDate(expires.getDate() + 30);

    if (users.length > 0) {
      //User exists.
      const user = users[0];
      const { uid } = user;

      res
        .cookie('logged_in', true, { expires })
        .cookie('uid', uid, { expires })
        .redirect('/');
    } else {
      //User doesn't exist.
      const user = await admin
        .auth()
        .getUser(uid)
        .then(data => data);

      const { email, displayName, photoURL } = user;

      User.create(
        {
          uid,
          displayName,
          photoURL,
          email
        },
        () => {
          res
            .cookie('logged_in', true, { expires })
            .cookie('uid', uid, { expires })
            .redirect('/');
        }
      );
    }
  } else {
    res.redirect('/user/login');
  }
});

router.route('/logout').get((req, res) => {
  if (!auth.isUserLoggedIn(req)) res.redirect('/');
  res
    .cookie('logged_in', '', { expires: new Date() })
    .cookie('uid', '', { expires: new Date() })
    .render('user/logout');
});

router.route('/').get(async (req, res) => {
  if (!auth.isUserLoggedIn(req)) res.redirect('/user/login');
  const { uid } = req.cookies;
  const users = await User.find({ uid }).then(data => data);
  const bookmarks = await Bookmark.find({ uid }, data => data);

  res.render('user/user', { data: users[0], bookmarks });
});

module.exports = router;
