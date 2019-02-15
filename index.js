const express = require('express');
const fs = require('fs');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./core/routers/app');
const user = require('./core/routers/user');
const topics = require('./core/routers/topics');
const bookmarks = require('./core/routers/bookmarks');
const misc = require('./core/routers/misc');
const admin = require('./core/routers/admin');
const exercises = require('./core/routers/exercises');

const functions = require('./core/functions');

const authModule = require('./core/modules/authModule');

require('dotenv').config();
require('./core/database/database');

const port = process.env.PORT || 80;

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

app.use(async (req, res, next) => {
  const user = await authModule.getLoggedUser(req);
  if (user !== null) await authModule.loginStats(user);
  next();
});

app.use((req, res, next) => {
  const log =
    functions.parseDate(new Date()) +
    ' [WEB, ' +
    (req.method == 'GET' ? ' ' : '') +
    req.method +
    '] ' +
    req.protocol +
    '://' +
    req.hostname +
    req.url;

  if (log.includes('favicon')) return;

  fs.appendFile(`logs/${functions.currentDate()}.log`, `${log}\n`, err => {
    if (err) console.error(err);
  });

  console.log(log);

  next();
});

app.use(functions.parseParams);

app.use('/', index);
app.use('/user', user);
app.use('/teemad', topics);
app.use('/bookmarks', bookmarks);
app.use(misc);
app.use('/admin', admin);
app.use('/ulesanded', exercises);

app.all('**', async (req, res) => {
  res.render('404', { path: req.path });
});

app.listen(port, () => {
  console.log('[WEB] Running on port %s!', port);
});
