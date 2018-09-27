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
const database = require('../modules/firebase/database');
const auth = require('../modules/authModule');

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
    const users = await database
      .collection('users')
      .where('authUid', '==', uid)
      .limit(1)
      .get()
      .then(snap => {
        let users = [];
        snap.forEach(doc => {
          if (doc && doc.exists) users.push(doc.data());
        });
        return users;
      })
      .catch(err => {
        console.error(err);
      });

    if (users.length > 0) {
      res
        .cookie('logged_in', true)
        .cookie('uid', users[0].uid)
        .cookie('authUid', uid)
        .redirect('/');
    } else {
      const nUid = functions.randomString(24);
      const user = await admin.auth().getUser(uid);

      database
        .doc(`users/${nUid}`)
        .set({
          uid: nUid,
          authUid: uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          email: user.email
        })
        .then(() => {
          res
            .cookie('logged_in', true)
            .cookie('uid', nUid)
            .cookie('authUid', uid)
            .redirect('/');
        })
        .catch(err => console.error(err));
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
    .cookie('authUid', '', { expires: new Date() })
    .render('user/logout');
});

router.route('/settings').get(async (req, res) => {
  if (!auth.isUserLoggedIn(req)) res.redirect('/user/login');
  res.send(
    '<pre>' +
      JSON.stringify(await auth.getUser(req.cookies['authUid']), null, 2) +
      '</pre>'
  );
});

module.exports = router;
