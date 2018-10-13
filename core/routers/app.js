const port = 80;

const express = require('express');
const router = express.Router();

const functions = require('../functions');

router.route('/').get(async (req, res) => {
  res.render('index', {
    selectedTopic: null,
    selectedField: null
  });
});

const log = (req, res, next) => {
  console.log(
    functions.currentTime() +
      ' [WEB, ' +
      req.method +
      '] ' +
      req.protocol +
      '://' +
      req.hostname +
      req.url
  );
  next();
};

module.exports = {
  router,
  port,
  log
};
