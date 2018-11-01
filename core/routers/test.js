const express = require('express');
const router = express.Router();

const Category = require('../database/models/Category');
const Topic = require('../database/models/Topic');
const Bookmark = require('../database/models/Bookmark');

router.route('/').get(async (req, res) => {
  Bookmark.create(
    {
      uid: 'zBFSe2perjSA6QFCijp3IShyZ9P2',
      id: 'uldine-ulesanne',
      url: 'test',
      title: 'lol'
    },
    () => res.send('done')
  );
});

module.exports = router;
