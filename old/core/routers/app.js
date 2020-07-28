const express = require('express');
const router = express.Router();

const _ = require('lodash');

const authModule = require('../modules/authModule');
const functions = require('../functions');

const Bookmark = require('../database/models/Bookmark');
const User = require('../database/models/User');

router.route('/').get(async (req, res) => {
  if (!req.cookies['visited']) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 14);

    res.cookie('visited', 'true', { expires }).redirect('/info');
  } else {
    if (await authModule.isUserLoggedIn(req)) {
      const session = await authModule.getSession(req);
      const { uid } = session;

      const recentBookmarks = await Bookmark.find({ uid })
        .sort({ timestamp: 'desc' })
        .limit(5)
        .then(data => data)
        .catch(err => functions.handle(err, '/core/routers/app.js'));

      const user = await User.find({ uid })
        .then(data => data[0])
        .catch(err => functions.handle(err, '/core/routers/app.js'));

      const { achievements } = user;
      const recentAchievements = _.take(
        _.orderBy(achievements, 'timestamp', 'desc'),
        5
      );

      res.render('index', {
        recentBookmarks,
        recentAchievements
      });
    } else {
      res.render('index', {
        recentBookmarks: [],
        recentAchievements: []
      });
    }
  }
});

module.exports = router;
