const router = require('express').Router();

const Category = require('../database/models/Category');
const Topic = require('../database/models/Topic');
const Exercise = require('../database/models/Exercise');

const ROLES = {
  ADMIN: 3,
  MODERATOR: 2,
  EDITOR: 1,
  USER: 0
};

router.route('/').get((req, res) => {
  res.render('admin/index');
});

router.route('/content').get(async (req, res) => {
  const _categories = await Category.find();
  const categories = [];

  for (const { id, title } of _categories) {
    const _topics = await Topic.find({ parent: id }, null, {
      sort: '-last_changed'
    }).catch(err => functions.handle(err, '/core/routers/admin.js'));

    const exercises = await Exercise.find({ category_id: id }, null, {
      sort: '-last_changed'
    }).catch(err => functions.handle(err, '/core/routers/admin.js'));

    const topics = [];
    for (let { title, id, data, last_changed } of _topics)
      topics.push({
        title,
        id,
        data,
        last_changed
      });

    categories.push({
      title,
      id,
      topics,
      exercises
    });
  }

  res.render('admin/content', { categories });
});

module.exports = router;
