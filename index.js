const express = require('express');

require('dotenv').config();
require('./core/database/database');

const moment = require('moment');

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

/* sitemap = sm.createSitemap({
  hostname: 'http://upt.kerdo.me',
  cacheTime: 600000,
  urls: surls
}); */

/* app.use(async (req, res, next) => {
  const user = await authModule.getLoggedUser(req);
  if (user !== null) await authModule.loginStats(user);
  next();
}); */

app.use((req, res, next) => {
  const log =
    '[' +
    moment(new Date().getTime())
      .locale('et')
      .format('LTS L') +
    ']' +
    ' [WEB, ' +
    (req.method == 'GET' ? ' ' : '') +
    req.method +
    '] ' +
    req.protocol +
    '://' +
    req.hostname +
    req.url;

  if (log.includes('php')) {
    return res.status(400).send();
  } else {
    if (!log.includes('favicon')) {
      // TODO: Logging

      console.log(log);
    }

    next();
  }
});

app.use(functions.parseParams);

app.use('/', index);
app.use('/user', user);
app.use('/teemad', topics);
app.use('/bookmarks', bookmarks);
app.use(misc);
app.use('/admin', admin);
app.use('/ulesanded', exercises);

/* app.route('/sitemap.xml').get(async (req, res) => {
  sitemap.toXML((err, xml) => {
    if (err) {
      functions.handle(err, '/index.js');
      return res.status(500).end();
    }
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });
}); */

app.all('**', async (req, res) => {
  res.render('404', { path: req.path });
});

app.listen(port, () => {
  console.log('[WEB] Running on port %s!', port);
});
