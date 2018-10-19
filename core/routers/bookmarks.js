const router = require('express').Router();

const authModule = require('../modules/authModule');
const functions = require('../functions');

const Bookmark = require('../database/models/Bookmark');

router.route('/set').post(async (req, res) => {
  if (!authModule.isUserLoggedIn(req)) res.redirect('/user/login');

  const { id, title, url } = req.body;
  const { uid } = req.cookies;

  if (uid && title && id) {
    const existingBookmarks = await Bookmark.find(
      { id, uid },
      (err, data) => data
    );

    if (existingBookmarks.length > 0) {
      res.status(200).send(
        JSON.stringify({
          status: -1
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
              status: 0
            })
          );
        }
      );
    }
  } else {
    res.status(200).send(
      JSON.stringify({
        status: -2
      })
    );
  }
});

router.route('/del').post(async (req, res) => {
  if (!authModule.isUserLoggedIn(req)) res.redirect('/user/login');

  const { id } = req.body;
  const { uid } = req.cookies;

  Bookmark.find({ id, uid }, (err, data) => {
    if (data.length > 0) {
      Bookmark.deleteOne({ uid, id }, () =>
        res.status(200).send(JSON.stringify({ status: 1 }))
      );
    } else {
      res.status(200).send(JSON.stringify({ status: -3 }));
    }
  });
});

module.exports = router;
