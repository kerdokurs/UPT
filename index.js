const express = require('express');

const moment = require('moment');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const session = require('express-session');

const port = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/static'));

const sess = session({
  secret: 'nc01KoS21ddw7A',
  resave: false,
  saveUninitialized: true,
  cookie: {}
});

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie = {
    secure: true,
    maxAge: 6e5
  };
}

app.use(sess);

app.use(async (req, res, next) => {
  res.locals = {
    pageTitle: 'Kerdo UPT'
  };

  next();
});

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

  console.log(log);
  next();
});

app.all('**', (req, res) => {
  res.render('404', { path: req.path });
});

app.listen(port, () => {
  console.log('[WEB] Running on port %s!', port);
});
