const port = 5505;

const express = require('express');
const router = express.Router();

const fs = require('fs');

const authModule = require('../modules/authModule');

const functions = require('../functions');
const database = require('../modules/firebase/database');

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
