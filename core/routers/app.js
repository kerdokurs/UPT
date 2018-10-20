const express = require('express');
const router = express.Router();

const functions = require('../functions');

router.route('/').get(async (req, res) => {
  res.render('index', {
    selectedTopic: null,
    selectedField: null
  });
});

module.exports = router;
