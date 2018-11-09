const router = require('express').Router();

const authModule = require('../modules/authModule');

const functions = require('../functions');

const User = require('../database/models/User');
const Session = require('../database/models/Session');

const Category = require('../database/models/Category');
const Topic = require('../database/models/Topic');

const Feedback = require('../database/models/Feedback');

router.use(authModule.adminGuard);

router.route('/').get(async (req, res) => {
  if (!(await authModule.isUserLoggedIn(req))) res.redirect('/user/login');
  const categories = await Category.find();

  let topics = await Topic.find().catch(err =>
    functions.handle(err, '/core/routers/admin.js')
  );
  topics = topics.sort((a, b) => {
    return b.last_changed - a.last_changed;
  });

  let users = await User.find().catch(err =>
    functions.handle(err, '/core/routers/admin.js')
  );
  users = users.sort((a, b) => {
    return b.sign_up - a.sign_up;
  });

  let feedback = await Feedback.find().catch(err =>
    functions.handle(err, '/core/routers/admin.js')
  );
  feedback = feedback.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });

  const sessions = await Session.find().catch(err =>
    functions.handle(err, '/core/routers/admin.js')
  );

  res.render('admin/index', { categories, topics, users, feedback, sessions });
});

router.route('/add_cat').post(async (req, res) => {
  const { id, title } = req.body;
  if (id && title)
    Category.create({ id, title }).then(() =>
      res.redirect('/admin#kategooriad')
    );
  else res.redirect('/admin#kategooriad');
});

router.route('/del_cat').post(async (req, res) => {
  const { id } = req.body;
  if (id)
    Category.deleteOne({ id }).then(() => res.redirect('/admin#kategooriad'));
  else res.redirect('/admin#kategooriad');
});

router.route('/add_top').post(async (req, res) => {
  const { id, title, category } = req.body;
  if (id && title && category) {
    Topic.create({
      title,
      id,
      parent: category,
      data: '# ' + title,
      last_changed: new Date()
    })
      .then(() => res.redirect('/admin/edit_topic/' + id))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  } else res.redirect('/admin#teemad');
});

router.route('/edit_topic/:id').get(async (req, res) => {
  const { id } = req.params;
  let data = await Topic.find({ id })
    .then(data => data)
    .catch(err => functions.handle(err, '/core/routers/admin.js'));
  data = data[0];

  res.render('admin/edit_topic', { data });
});

router.route('/edit_topic/:id').post(async (req, res) => {
  const { id } = req.params;
  const { title, data } = req.body;
  if ((id && title, data)) {
    Topic.update({ id }, { $set: { title, data, last_changed: new Date() } })
      .then(() => res.redirect('/admin#teemad'))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  } else res.redirect('/admin#teemad');
});

router.route('/del_top').post(async (req, res) => {
  const { id } = req.body;
  if (id)
    Topic.deleteOne({ id })
      .then(() => res.redirect('/admin#teemad'))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  else res.redirect('/admin#teemad');
});

router.route('/add_adm').post(async (req, res) => {
  const { uid } = req.body;
  if (uid)
    User.updateOne({ uid }, { $set: { admin: true } })
      .then(() => res.redirect('/admin#kasutajad'))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  else res.redirect('/admin#kasutajad');
});

router.route('/del_adm').post(async (req, res) => {
  const { uid } = req.body;
  if (uid)
    User.updateOne({ uid }, { $set: { admin: false } })
      .then(() => res.redirect('/admin#kasutajad'))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  else res.redirect('/admin#kasutajad');
});

router.route('/del_fdb').post(async (req, res) => {
  const { id } = req.body;
  if (id)
    Feedback.deleteOne({ id })
      .then(() => res.redirect('/admin#tagasiside'))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  else res.redirect('/admin#tagasiside');
});

router.route('/refresh_sessions').get(async (req, res) => {
  const now = new Date();
  now.setDate(now.getDate() - 30);
  Session.deleteMany({ created_at: { $lte: now } })
    .then(() => res.redirect('/admin#kasutajad'))
    .catch(err => functions.handle(err, '/core/routers/admin.js'));
});

module.exports = router;
