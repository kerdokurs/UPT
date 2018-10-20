const router = require('express').Router();

const authModule = require('../modules/authModule');

const Feedback = require('../database/models/Feedback');

router.use(authModule.isUserAdmin);

router.route('/bookmarks').get(async (req, res) => {
  const data = await Feedback.find({}, (err, data) => data);
  res.send('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
});

module.exports = router;
