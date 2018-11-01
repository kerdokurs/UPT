const router = require('express').Router();

const adminData = require('./admin-data');

const authModule = require('../modules/authModule');

const Feedback = require('../database/models/Feedback');

router.use(authModule.adminGuard);

router.route('/bookmarks').get(async (req, res) => {
  const data = await Feedback.find({}, (err, data) => data);
  res.send('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
});

router.use('/data', adminData);

module.exports = router;
