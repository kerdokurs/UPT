/**
 * @author Kerdo
 * Website https://ktch.tk/
 * Contact kerdo@ktch.tk
 * Copyright (c) Kerdo 2018
 */

'use strict';

const express = require('express');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./core/app');
const user = require('./core/user');

const app = express();

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/static'));

app.use(index.log);

/* const astmed = require('./core/kymne-astmed');
app.use('/astmed', astmed);

app.use('/user', user.router); */
app.use('/', index.router);
app.use('/user', user);

app.listen(index.port, () => {
  console.log('[WEB] Listening on port %s', index.port);
});
