// Laisklaadimise kasutamiseks.

const router = require('express').Router();

router.route('/').get((req, res) => {
  res.send(JSON.stringify({ status: 200, msg: 'OK' }));
});

module.exports = router;
