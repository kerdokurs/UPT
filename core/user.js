/**
 * @author Kerdo
 * Website https://ktch.tk/
 * Contact kerdo@ktch.tk
 * Copyright (c) Kerdo 2018
 */
'use strict';

const router = require('express').Router();

const functions = require('./functions');
const database = require('./database');

router.route('/settings').get(async (req, res) => {
  res.render('user/settings', {
    teemad: functions.getTopics(),
    user: functions.getCurrentUser(req, database),
    loggedIn: functions.isUserLoggedIn(req)
  });
});

router.route('/login').get(async (req, res) => {
  if (functions.isUserLoggedIn(req)) res.redirect('/user');
  else {
    res.render('user/login');
  }
});

router.route('/post-login').get(async (req, res) => {
  if (functions.isUserLoggedIn(req)) res.redirect('/');
  const { uid, displayName, photoUrl, email } = req.query;
  if (uid && displayName && photoUrl && email) {
    const user = await database
      .collection('users')
      .where('uid', '==', uid)
      .limit(1)
      .get()
      .then(snap => {
        let user;
        snap.forEach(doc => (user = doc));
      })
      .catch(err => {
        res.send(err);
      });

    if (user) {
      res
        .cookie('uid', doc.id)
        .cookie('logged_in', true)
        .redirect('/user');
    } else {
      const nuid = functions.randomString(12);

      database
        .doc(`users/${nuid}`)
        .set({
          uid: uid,
          displayName: displayName,
          email: email,
          photoUrl
        })
        .then(() => {
          res
            .cookie('uid', nuid)
            .cookie('logged_in', true)
            .redirect('/');
        })
        .catch(err => res.send(err));
    }
  } else {
    res.redirect('/user/login');
  }
});

router.route('/logout').get((req, res) => {
  if (!functions.isUserLoggedIn(req)) res.redirect('/');
  res
    .cookie('logged_in', '', { expires: new Date() })
    .cookie('uid', '', { expires: new Date() })
    .render('user/logout');
});

router.route('/').get((req, res) => {
  res.render('user/user', { username: 'Kerdo' });
});

module.exports = router;
