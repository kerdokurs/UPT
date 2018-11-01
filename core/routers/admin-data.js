const router = require('express').Router();

const Category = require('../database/models/Category');
const Topic = require('../database/models/Topic');

router.route('/').get(async (req, res) => {
  const categories = await Category.find();
  const topics = await Topic.find();
  res.render('admin/index', { categories, topics });
});

router.route('/add_cat').post(async (req, res) => {
  const { id, title } = req.body;
  if (id && title) Category.create({ id, title }, () => res.redirect('/admin'));
  else res.redirect('/admin');
});

router.route('/del_cat').post(async (req, res) => {
  const { id } = req.body;
  if (id) Category.deleteOne({ id }, () => res.redirect('/admin'));
  else res.redirect('/admin');
});

router.route('/add_top').post(async (req, res) => {
  const { id, title, category } = req.body;
  if (id && title && category) {
    Topic.create(
      {
        title,
        id,
        parent: category,
        data: '# ' + title,
        last_changed: new Date()
      },
      (err, data) => res.redirect('/admin/edit_topic/' + id)
    );
  } else res.redirect('/admin');
});

router.route('/edit_topic/:id').get(async (req, res) => {
  const { id } = req.params;
  let data = await Topic.find({ id }, (err, data) => {
    return data;
  });
  data = data[0];

  res.render('admin/data/edit_topic', { data });
});

router.route('/edit_topic/:id').post(async (req, res) => {
  const { id } = req.params;
  const { title, data } = req.body;
  if ((id && title, data)) {
    Topic.update(
      { id },
      { $set: { title, data, last_changed: new Date() } },
      () => res.redirect('/admin')
    );
  } else res.redirect('/admin');
});

router.route('/del_top').post(async (req, res) => {
  const { id } = req.body;
  if (id) Topic.deleteOne({ id }, () => res.redirect('/admin'));
  else res.redirect('/admin');
});

module.exports = router;
