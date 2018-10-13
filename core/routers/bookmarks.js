const router = require('express').Router();

const authModule = require('../modules/authModule');
const functions = require('../functions');

const Bookmark = require('../database/models/Bookmark');

router.route('/set').get(async (req, res) => {
  if (!authModule.isUserLoggedIn(req)) res.redirect('/user/login');

  const { id, title, url } = req.query;
  const { uid } = req.cookies;

  if (uid && title && id) {
    const existingBookmarks = await Bookmark.find(
      { id, uid },
      (err, data) => data
    );

    if (existingBookmarks.length > 0) {
      res.status(403).send(
        JSON.stringify({
          status: 403,
          message: 'Bookmark already exists'
        })
      );
    } else {
      Bookmark.create(
        {
          id,
          uid,
          url: unescape(url),
          title: unescape(title)
        },
        () => {
          res.status(200).send(
            JSON.stringify({
              status: 200,
              message: 'Bookmark saved!'
            })
          );
        }
      );
    }
  } else {
    res.status(400).send(
      JSON.stringify({
        status: 400,
        message: 'Invalid parameters'
      })
    );
  }
});

router.route('/del').get(async (req, res) => {
  if (!authModule.isUserLoggedIn(req)) res.redirect('/user/login');

  const { id } = req.query;
  const { uid } = req.cookies;

  Bookmark.find({ id, uid }, (err, data) => {
    if (data.length > 0) {
      Bookmark.deleteOne({ uid, id }, () =>
        res
          .status(200)
          .send(JSON.stringify({ status: 200, message: 'Bookmark deleted!' }))
      );
    } else {
      res
        .status(404)
        .send(JSON.stringify({ status: 404, message: 'Bookmark not found!' }));
    }
  });
});

module.exports = router;
