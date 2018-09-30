/**
 * @author Kerdo
 * Website https://ktch.tk/
 * Contact kerdo@ktch.tk
 * Copyright (c) Kerdo 2018
 */
'use strict';

const router = require('express').Router();

const functions = require('../functions');
const admin = require('../modules/firebase/admin');
const auth = require('../modules/authModule');

require('../database/database');
const User = require('../database/models/User');

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

    if (users.length > 0) {
      //User exists.
      const user = users[0];
      const { uid } = user;

      res
        .cookie('logged_in', true)
        .cookie('uid', uid)
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
            .cookie('logged_in', true)
            .cookie('uid', uid)
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

  res.send('<pre>' + JSON.stringify(users[0], null, 2) + '</pre>');
});

module.exports = router;
