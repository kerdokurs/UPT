'use strict';

const router = require('express').Router();

const functions = require('../functions');

const Feedback = require('../database/models/Feedback');

router.route('/info').get((req, res) => {
  res.render('misc/info');
});

router.route('/feedback').get((req, res) => {
  res.render('misc/feedback');
});

router.route('/feedback-submit').post((req, res) => {
  const { name, text } = req.body;
  const { uid } = req.cookies;

  if (name && text) {
    Feedback.create({ id: functions.randomString(24), uid, text, name }, () => {
      res.status(200).send(
        JSON.stringify({
          status: 0
        })
      );
    });
  } else {
    res.status(200).send(
      JSON.stringify({
        status: -1
      })
    );
  }
});

router.route('/report').get((req, res) => {
  res.send('report');
});

module.exports = router;
