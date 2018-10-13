#!/usr/bin/env node

const express = require('express');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./core/routers/app');
const user = require('./core/routers/user');
const topics = require('./core/routers/topics');
const bookmarks = require('./core/routers/bookmarks');

require('dotenv').config();

const locals = require('./core/locals');

const app = express();

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/static'));

app.use(async (req, res, next) => {
  res.locals = await locals.get(req);
  next();
});

app.use(index.log);

app.use('/', index.router);
app.use('/user', user);
app.use('/teemad', topics);
app.use('/bookmarks', bookmarks);

app.get('**', async (req, res) => {
  res.render('404', {
    topic: null,
    field: null
  });
});

app.listen(index.port, () => {
  console.log('[WEB] Running on port %s!', index.port);
});
