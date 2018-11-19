const express = require('express');
const router = express.Router();

const authModule = require('../modules/authModule');
const functions = require('../functions');

const Bookmark = require('../database/models/Bookmark');

router.route('/').get(async (req, res) => {
  if (await authModule.isUserLoggedIn(req)) {
    const session = await authModule.getSession(req);
    const { uid } = session;

    const recentBookmarks = await Bookmark.find({ uid })
      .sort({ timestamp: 'desc' })
      .limit(5)
      .then(data => data)
      .catch(err => functions.handle(err, '/core/routers/app.js'));

    res.render('index', { recentBookmarks });
  } else {
    res.render('index');
  }
});

module.exports = router;
