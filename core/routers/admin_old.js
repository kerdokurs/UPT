const router = require('express').Router();

const fs = require('fs');

const authModule = require('../modules/authModule');

const functions = require('../functions');

const User = require('../database/models/User');
const Session = require('../database/models/Session');

const Category = require('../database/models/Category');
const Topic = require('../database/models/Topic');

const Achievement = require('../database/models/Achievement');

const Feedback = require('../database/models/Feedback');

const ExerciseCategory = require('../database/models/ExerciseCategory');
const Exercise = require('../database/models/Exercise');
const Quiz = require('../database/models/Quiz');

router.use(authModule.adminGuard);

router.route('/').get(async (req, res) => {
  const _categories = await Category.find();

  const categories = [];
  for (const { id, title } of _categories) {
    const _topics = await Topic.find({ parent: id }, null, {
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
      topics
    });
  }

  const users = await User.find({}, null, { sort: '-sign_up' }).catch(err =>
    functions.handle(err, '/core/routers/admin.js')
  );

  const feedback = await Feedback.find({}, null, {
    sort: '-timestamp'
  }).catch(err => functions.handle(err, '/core/routers/admin.js'));

  const achievements = await Achievement.find({}, null, {
    sort: '-timestamp'
  }).catch(err => functions.handle(err, '/core/routers/admin.js'));

  const _sessions = await Session.find({}, null, {
    sort: '-timestamp'
  }).catch(err => functions.handle(err, '/core/routers/admin.js'));

  const sessions = [];
  for (const { id, uid, created_at } of _sessions) {
    let displayName = '';
    for (let user of users) {
      if (user.uid == uid) {
        displayName = user.displayName;
        break;
      }
    }

    sessions.push({
      id,
      displayName,
      created_at
    });
  }

  let exerciseCategories = await ExerciseCategory.find().catch(err =>
    functions.handle(err, '/core/routers/admin.js')
  );

  const exercise_categories = [];
  for (let exerciseCategory of exerciseCategories) {
    const { title, id, last_changed } = exerciseCategory;

    const exercises = await Exercise.find({ category_id: id }, null, {
      sort: '-last_changed'
    }).catch(err => functions.handle(err, '/core/routers/admin.js'));
    const quizzes = await Quiz.find({ category_id: id }, null, {
      sort: '-last_changed'
    }).catch(err => functions.handle(err, '/core/routers/admin.js'));

    const category_exercises = [];
    for (let {
      id,
      title,
      data,
      metadata,
      created_at,
      last_changed,
      published
    } of exercises) {
      category_exercises.push({
        id,
        title,
        data,
        metadata,
        created_at,
        last_changed,
        published,
        type: 'e'
      });
    }

    for (let {
      id,
      title,
      data,
      metadata,
      created_at,
      last_changed,
      published
    } of quizzes) {
      category_exercises.push({
        id,
        title,
        data,
        metadata,
        created_at,
        last_changed,
        published,
        type: 'q'
      });
    }

    exercise_categories.push({
      title,
      id,
      last_changed,
      exercises: category_exercises
    });
  }

  const logFiles = [];
  // fs.readdirSync('logs').forEach(file => logFiles.push(file));

  res.render('admin/index', {
    categories,
    users,
    feedback,
    sessions,
    achievements,
    exercise_categories,
    logFiles
  });
});

router.route('/add_cat').post(async (req, res) => {
  const { id, title } = req.body;
  if (id && title)
    Category.create({ id, title })
      .then(() => res.redirect('/admin#sisu'))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  else res.redirect('/admin#sisu');
});

router.route('/del_cat').post(async (req, res) => {
  const { id } = req.body;
  if (id)
    Category.deleteOne({ id })
      .then(() => res.redirect('/admin#sisu'))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
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
  let data = await Topic.findOne({
    id: id.split(':')[1],
    parent: id.split(':')[0]
  }).catch(err => functions.handle(err, '/core/routers/admin.js'));

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

router.route('/toggle_admin').post(async (req, res) => {
  const { uid } = req.body;
  if (uid) {
    const data = await User.findOne({ uid });
    User.updateOne(
      { uid },
      {
        $set: {
          admin: !data.admin
        }
      }
    )
      .then(() => res.redirect('/admin#kasutajad'))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  } else res.redirect('/admin#kasutajad');
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
  Session.deleteMany({ created_at: { $lt: now } })
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
      last_changed: new Date(),
      published: false
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

// TODO: Luba ainult avalikustatud saavutuste teenimine.
router.route('/toggle_ach_published').post(async (req, res) => {
  const { id } = req.body;

  if (id) {
    const data = await Achievement.findOne({ id });
    Achievement.updateOne({ id }, { $set: { published: !data.published } })
      .then(() => res.redirect('/admin/#saavutused'))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  } else res.redirect('/admin/#saavutused');
});

router.route('/add_exe_cat').post(async (req, res) => {
  const { id, title } = req.body;

  if (id && title) {
    await ExerciseCategory.create({
      id,
      title,
      created_at: new Date(),
      last_changed: new Date()
    })
      .then(() => res.redirect('/admin/#ulesanded'))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  } else res.redirect('/admin/#ulesanded');
});

router.route('/add_exe').post(async (req, res) => {
  const { title, id, category, type } = req.body;

  if (title && id && category && type) {
    if (type == 'e') {
      await Exercise.create({
        id,
        title,
        category_id: category,
        data: JSON.parse(
          fs.readFileSync('./data/exercise_data_boilerplate.json').toString()
        ),
        metadata: {},
        created_at: new Date(),
        last_changed: new Date(),
        published: false
      })
        .then(() => res.redirect('/admin/#ulesanded'))
        .catch(err => functions.handle(err, '/core/routers/admin.js'));
    } else if (type == 'q') {
      await Quiz.create({
        id,
        title,
        category_id: category,
        data: JSON.parse(
          fs.readFileSync('./data/quiz_data_boilerplate.json').toString()
        ),
        metadata: {},
        created_at: new Date(),
        last_changed: new Date(),
        published: false
      })
        .then(() => res.redirect('/admin/#ulesanded'))
        .catch(err => functions.handle(err, '/core/routers/admin.js'));
    }
  } else res.redirect('/admin/#ulesanded');
});

router.route('/del_exe').post(async (req, res) => {
  const { id, type } = req.body;

  if (id) {
    const ids = id.split(':');
    const cat_id = ids[0],
      exe_id = ids[1];

    if (exe_id && cat_id && type) {
      if (type == 'e') {
        await Exercise.deleteOne({ id: exe_id, category_id: cat_id })
          .then(() => res.redirect('/admin/#ulesanded'))
          .catch(err => functions.handle(err, '/core/routers/admin.js'));
      } else if (type == 'q') {
        await Quiz.deleteOne({ id: exe_id, category_id: cat_id })
          .then(() => res.redirect('/admin/#ulesanded'))
          .catch(err => functions.handle(err, '/core/routers/admin.js'));
      }
    } else res.redirect('/admin/#ulesanded');
  } else res.redirect('/admin/#ulesanded');
});

router.route('/edit_exercise/:id/:type').get(async (req, res) => {
  const { id, type } = req.params;
  if (id && type) {
    const ids = id.split(':');
    const cat_id = ids[0],
      exe_id = ids[1];

    if (cat_id && exe_id) {
      let exercise;

      if (type == 'e') {
        exercise = await Exercise.findOne({
          id: exe_id,
          category_id: cat_id
        }).catch(err => functions.handle(err, '/core/routers/admin.js'));
      } else if (type == 'q') {
        exercise = await Quiz.findOne({
          id: exe_id,
          category_id: cat_id
        }).catch(err => functions.handle(err, '/core/routers/admin.js'));
      }

      if (exercise === null || exercise === undefined)
        res.redirect('/admin/#ulesanded');

      res.render('admin/edit_exercise', {
        exercise,
        cat_id,
        type
      });
    } else res.redirect('/admin/#ulesanded');
  } else res.redirect('/admin/#ulesanded');
});

router.route('/edit_exercise/:id/:type').post(async (req, res) => {
  const { id, type } = req.params;
  const { title, data } = req.body;
  if (id && title && data && type) {
    const ids = id.split(':');
    const cat_id = ids[0],
      exe_id = ids[1];

    if (cat_id && exe_id) {
      if (type == 'e') {
        await Exercise.updateOne(
          { id: exe_id, category_id: cat_id },
          {
            $set: {
              title,
              data: JSON.parse(data),
              last_changed: new Date()
            }
          }
        ).catch(err => functions.handle(err, '/core/routers/admin.js'));
      } else if (type == 'q') {
        await Quiz.updateOne(
          { id: exe_id, category_id: cat_id },
          {
            $set: {
              title,
              data: JSON.parse(data),
              last_changed: new Date()
            }
          }
        ).catch(err => functions.handle(err, '/core/routers/admin.js'));
      }

      res.redirect(`/admin/edit_exercise/${id}/${type}`);
    } else res.redirect('/admin/#ulesanded');
  } else res.redirect('/admin/#ulesanded');
});

router.route('/toggle_exe_published').post(async (req, res) => {
  const { id, type } = req.body;

  if (id && type) {
    const ids = id.split(':');
    const cat_id = ids[0],
      exe_id = ids[1];

    if (cat_id && exe_id) {
      if (type == 'e') {
        const data = await Exercise.findOne({
          id: exe_id,
          category_id: cat_id
        }).catch(err => functions.handle(err, '/core/routers/admin.js'));
        await Exercise.updateOne(
          {
            id: exe_id,
            category_id: cat_id
          },
          {
            $set: {
              published: !data.published
            }
          }
        )
          .then(() => res.redirect('/admin/#ulesanded'))
          .catch(err => functions.handle(err, '/core/routers/admin.js'));
      } else {
        const data = await Quiz.findOne({
          id: exe_id,
          category_id: cat_id
        }).catch(err => functions.handle(err, '/core/routers/admin.js'));
        await Quiz.updateOne(
          {
            id: exe_id,
            category_id: cat_id
          },
          {
            $set: {
              published: !data.published
            }
          }
        )
          .then(() => res.redirect('/admin/#ulesanded'))
          .catch(err => functions.handle(err, '/core/routers/admin.js'));
      }
    } else res.redirect('/admin/#ulesanded');
  } else res.redirect('/admin/#ulesanded');
});

router.route('/logs/:fn').get((req, res) => {
  const { fn } = req.params;

  if (fn) {
    const data = fs.readFileSync(`logs/${fn}`).toString();

    res.send('<pre>' + data + '</pre>');
  } else res.redirect('/admin#logid');
});

module.exports = router;
