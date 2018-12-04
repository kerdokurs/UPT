const router = require('express').Router();

const authModule = require('../modules/authModule');

const functions = require('../functions');

const User = require('../database/models/User');
const Session = require('../database/models/Session');

const Category = require('../database/models/Category');
const Topic = require('../database/models/Topic');

const Achievement = require('../database/models/Achievement');

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

  let achievements = await Achievement.find().catch(err =>
    functions.handle(err, '/core/routers/admin.js')
  );
  achievements = achievements.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });

  const sessions = await Session.find().catch(err =>
    functions.handle(err, '/core/routers/admin.js')
  );

  res.render('admin/index', {
    categories,
    topics,
    users,
    feedback,
    sessions,
    achievements
  });
});

router.route('/add_cat').post(async (req, res) => {
  const { id, title } = req.body;
  if (id && title)
    Category.create({ id, title }).then(() => res.redirect('/admin#sisu'));
  else res.redirect('/admin#sisu');
});

router.route('/del_cat').post(async (req, res) => {
  const { id } = req.body;
  if (id) Category.deleteOne({ id }).then(() => res.redirect('/admin#sisu'));
  else res.redirect('/admin#sisu');
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
      .then(() => res.redirect('/admin/edit_topic/' + category + ':' + id))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  } else res.redirect('/admin#sisu');
});

router.route('/edit_topic/:id').get(async (req, res) => {
  const { id } = req.params;
  let data = await Topic.find({
    id: id.split(':')[1],
    parent: id.split(':')[0]
  })
    .then(data => data)
    .catch(err => functions.handle(err, '/core/routers/admin.js'));
  data = data[0];

  res.render('admin/edit_topic', { data });
});

router.route('/edit_topic/:id').post(async (req, res) => {
  const { id } = req.params;
  const { title, data } = req.body;
  if (id && title && data) {
    Topic.updateOne(
      { id: id.split(':')[1], parent: id.split(':')[0] },
      { $set: { title, data, last_changed: new Date() } }
    )
      .then(() =>
        res.redirect(
          '/admin/edit_topic/' + id.split(':')[0] + ':' + id.split(':')[1]
        )
      )
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  } else
    res.redirect(
      '/admin/edit_topic/' + id.split(':')[0] + ':' + id.split(':')[1]
    );
});

router.route('/del_top').post(async (req, res) => {
  const { id } = req.body;
  if (id)
    Topic.deleteOne({ id: id.split(':')[1], parent: id.split(':')[0] })
      .then(() => res.redirect('/admin#sisu'))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  else res.redirect('/admin#sisu');
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

router.route('/add_ach').post(async (req, res) => {
  const { id, title, description } = req.body;
  if (id && title && description) {
    Achievement.create({
      id,
      title,
      description,
      last_changed: new Date()
    })
      .then(() => res.redirect('/admin#saavutused'))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  } else res.redirect('/admin#saavutused');
});

router.route('/del_ach').post(async (req, res) => {
  const { id } = req.body;
  if (id) {
    Achievement.deleteOne({ id })
      .then(() => res.redirect('/admin#saavutused'))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  } else res.redirect('/admin#saavutused');
});

router.route('/edit_achievement/:id').get(async (req, res) => {
  const { id } = req.params;
  if (id) {
    let achievement = await Achievement.find({ id })
      .then(data => data)
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
    achievement = achievement[0];

    res.render('admin/edit_achievement', { achievement });
  } else res.redirect('/admin#saavutused');
});

router.route('/edit_achievement/:id').post(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  if (id && title && description) {
    Achievement.updateOne(
      { id },
      {
        $set: {
          title,
          description
        }
      }
    )
      .then(() => res.redirect('/admin/edit_achievement/' + id))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  } else res.redirect('/admin#saavutused');
});

module.exports = router;
