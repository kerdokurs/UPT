/**
 * @author Kerdo
 * Website https://ktch.tk/
 * Contact kerdo@ktch.tk
 * Copyright (c) Kerdo 2018
 */

'use strict';

const port = 5505;

const express = require('express');
const router = express.Router();

const fs = require('fs');

const functions = require('./functions');
const database = require('./database');

router.route('/').get(async (req, res) => {
  const user = await functions.getCurrentUser(req, database);
  res.render('index', {
    teemad: functions.getTopics(),
    user,
    loggedIn: functions.isUserLoggedIn(req)
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
