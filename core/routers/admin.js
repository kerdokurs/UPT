const router = require('express').Router();

const authModule = require('../modules/authModule');

const User = require('../database/models/User');

const Category = require('../database/models/Category');
const Topic = require('../database/models/Topic');

const Feedback = require('../database/models/Feedback');

router.use(authModule.adminGuard);

router.route('/').get(async (req, res) => {
  const categories = await Category.find();
  const topics = await Topic.find();
  const admins = await User.find({ admin: true });
  const feedback = await Feedback.find();
  res.render('admin/index', { categories, topics, admins, feedback });
});

router.route('/add_cat').post(async (req, res) => {
  const { id, title } = req.body;
  if (id && title)
    Category.create({ id, title }, () => res.redirect('/admin#kategooriad'));
  else res.redirect('/admin#kategooriad');
});

router.route('/del_cat').post(async (req, res) => {
  const { id } = req.body;
  if (id) Category.deleteOne({ id }, () => res.redirect('/admin#kategooriad'));
  else res.redirect('/admin#kategooriad');
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
  } else res.redirect('/admin#teemad');
});

router.route('/edit_topic/:id').get(async (req, res) => {
  const { id } = req.params;
  let data = await Topic.find({ id }, (err, data) => {
    return data;
  });
  data = data[0];

  res.render('admin/edit_topic', { data });
});

router.route('/edit_topic/:id').post(async (req, res) => {
  const { id } = req.params;
  const { title, data } = req.body;
  if ((id && title, data)) {
    Topic.update(
      { id },
      { $set: { title, data, last_changed: new Date() } },
      () => res.redirect('/admin#teemad')
    );
  } else res.redirect('/admin#teemad');
});

router.route('/del_top').post(async (req, res) => {
  const { id } = req.body;
  if (id) Topic.deleteOne({ id }, () => res.redirect('/admin#teemad'));
  else res.redirect('/admin#teemad');
});

router.route('/del_adm').post(async (req, res) => {
  const { uid } = req.body;
  if (uid)
    User.updateOne({ uid }, { $set: { admin: false } }, () =>
      res.redirect('/admin#adminid')
    );
  else res.redirect('/admin#adminid');
});

router.route('/del_fdb').post(async (req, res) => {
  const { id } = req.body;
  if (id) Feedback.deleteOne({ id }, () => res.redirect('/admin#tagasiside'));
  else res.redirect('/admin#tagasiside');
});

module.exports = router;
