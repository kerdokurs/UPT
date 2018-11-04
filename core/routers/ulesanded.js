const router = require('express').Router();

const authModule = require('../modules/authModule');

// TODO: Ülesanded
router.route('/').get((req, res) => {
  res.send('ÜLESANDED.');
});

module.exports = router;
