const router = require('express').Router();

const authModule = require('../modules/authModule');

const User = require('../database/models/User');

const Category = require('../database/models/Category');
const Topic = require('../database/models/Topic');

const Feedback = require('../database/models/Feedback');

router.use(authModule.adminGuard);

router.route('/').get(async (req, res) => {
  const categories = await Category.find();

  let topics = await Topic.find();
  topics = topics.sort((a, b) => {
    return b.last_changed - a.last_changed;
  });

  let users = await User.find();
  users = users.sort((a, b) => {
    return b.sign_up - a.sign_up;
  });

  let feedback = await Feedback.find();
  feedback = feedback.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });

  res.render('admin/index', { categories, topics, users, feedback });
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

router.route('/add_adm').post(async (req, res) => {
  const { uid } = req.body;
  if (uid)
    User.updateOne({ uid }, { $set: { admin: true } }, () =>
      res.redirect('/admin#kasutajad')
    );
  else res.redirect('/admin#kasutajad');
});

router.route('/del_adm').post(async (req, res) => {
  const { uid } = req.body;
  if (uid)
    User.updateOne({ uid }, { $set: { admin: false } }, () =>
      res.redirect('/admin#kasutajad')
    );
  else res.redirect('/admin#kasutajad');
});

router.route('/del_fdb').post(async (req, res) => {
  const { id } = req.body;
  if (id) Feedback.deleteOne({ id }, () => res.redirect('/admin#tagasiside'));
  else res.redirect('/admin#tagasiside');
});

module.exports = router;
