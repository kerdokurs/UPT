'use strict';

const router = require('express').Router();

router.route('/info').get((req, res) => {
  res.render('misc/info');
});

router.route('/feedback').get((req, res) => {
  res.render('misc/feedback');
});

router.route('/report').get((req, res) => {
  res.send('report');
});

module.exports = router;
