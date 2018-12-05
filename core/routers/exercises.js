const router = require('express').Router();

const authModule = require('../modules/authModule');
const exerciseModule = require('../modules/exerciseModule');

router.use(authModule.loginGuard);

router.route('/').get(async (req, res) => {
  res.send('ÜLESANDED.');
});

router.route('/astmed').get(async (req, res) => {
  const data = await exerciseModule.astmed.generate();

  res.render('exercises/astmed', { data });
});

router.route('/astmed').post(async (req, res) => {
  res.send('<pre>' + JSON.stringify(req.body, null, 2) + '</pre>');
});

module.exports = router;
