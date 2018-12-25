'use strict';

const router = require('express').Router();

const functions = require('../functions');

const Feedback = require('../database/models/Feedback');
const Topic = require('../database/models/Topic');
const Category = require('../database/models/Category');

const authModule = require('../modules/authModule');

router.route('/info').get((req, res) => {
  res.render('misc/info');
});

router.route('/feedback').get((req, res) => {
  res.render('misc/feedback');
});

router.route('/feedback').post(async (req, res) => {
  const { name, text } = req.body;
  const { uid } = await authModule.getSession(req);

  if (name && text) {
    Feedback.create({ id: functions.randomString(24), uid, text, name })
      .then(() => {
        res.status(200).send(
          JSON.stringify({
            status: 0
          })
        );
      })
      .catch(err => functions.handle(err, '/core/routers/misc.js'));
  } else {
    res.status(200).send(
      JSON.stringify({
        status: -1
      })
    );
  }
});

router.route('/search').get(async (req, res) => {
  const { query } = req.query;

  if (query && query.length > 2) {
    const foundTopics = await Topic.find({
      $or: [
        {
          id: new RegExp(query, 'gi')
        },
        {
          title: new RegExp(query, 'gi')
        }
      ]
    })
      .then(data => data)
      .catch(err => functions.handle(err, '/core/routers/misc.js'));

    const foundCategories = await Category.find({
      $or: [
        {
          id: new RegExp(query, 'gi')
        },
        {
          title: new RegExp(query, 'gi')
        }
      ]
    })
      .then(data => data)
      .catch(err => functions.handle(err, '/core/routers/misc.js'));

    res.render('search', {
      foundTopics,
      foundCategories,
      searched: query,
      foundExercises: []
    });
  } else
    res.render('search', {
      foundTopics: [],
      foundCategories: [],
      searched: query
    });
});

module.exports = router;
