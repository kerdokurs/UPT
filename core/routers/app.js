const express = require('express');
const router = express.Router();

const _ = require('lodash');

const authModule = require('../modules/authModule');
const functions = require('../functions');

const Bookmark = require('../database/models/Bookmark');
const User = require('../database/models/User');

router.route('/').get(async (req, res) => {
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

    let { achievements } = user;
    const recentAchievements = _.take(
      _.orderBy(achievements, 'timestamp', 'desc'),
      5
    );

    const weeklyLogins = await getUserActivity(req, 7);
    const weeklyOptions = { title: 'Viimase 7 päeva sisselogimised' };

    res.render('index', {
      recentBookmarks,
      recentAchievements,
      activity: {
        data: JSON.stringify(weeklyLogins),
        options: JSON.stringify(weeklyOptions)
      }
    });
  } else {
    res.render('index');
  }
});

module.exports = router;

//TODO: Liiguta see kuskile mujale

async function getUserActivity(req, limit) {
  const user = await authModule.getLoggedUser(req);
  if (user == null) return [];
  const activity = user.metadata.activity;
  if (activity == null) return [];
  const data = [['Kuupäev', 'Sisselogitud', { role: 'style' }]];
  for (let i = 0; i < limit; i++) {
    let entry = activity.shift();
    if (entry != null) {
      entry = entry.toString();
      entry = `${entry.substr(0, 2)}/${entry.substr(2, 2)}/${entry.substr(
        4,
        4
      )}`;
      data.push([entry, 1, '#' + functions.randomHexString()]);
    }
  }
  return data;
}
