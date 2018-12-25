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

router.use(authModule.adminGuard);

router.route('/').get(async (req, res) => {
  if (!(await authModule.isUserLoggedIn(req))) res.redirect('/user/login');
  const _categories = await Category.find();

  const categories = [];
  for (const { id, title } of _categories) {
    let _topics = await Topic.find({ parent: id }).catch(err =>
      functions.handle(err, '/core/routers/admin.js')
    );
    _topics = _topics.sort((a, b) => {
      return b.last_changed - a.last_changed;
    });

    const topics = [];
    for (let { title, id, data, last_changed } of _topics)
      topics.push({
        title,
        id,
        data,
        last_changed: functions.parseDate(last_changed)
      });

    categories.push({
      title,
      id,
      topics
    });
  }

  let users = await User.find().catch(err =>
    functions.handle(err, '/core/routers/admin.js')
  );
  users = users.sort((a, b) => {
    return b.sign_up - a.sign_up;
  });

  let _feedback = await Feedback.find().catch(err =>
    functions.handle(err, '/core/routers/admin.js')
  );
  _feedback = _feedback.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });

  const feedback = _feedback.map(({ id, uid, timestamp, name, text }) => {
    return {
      id,
      uid,
      timestamp: functions.parseDate(timestamp),
      name,
      text
    };
  });

  let _achievements = await Achievement.find().catch(err =>
    functions.handle(err, '/core/routers/admin.js')
  );
  _achievements = _achievements.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });

  const achievements = [];
  for (const { id, title, description, last_changed } of _achievements)
    achievements.push({
      id,
      title,
      description,
      last_changed: functions.parseDate(last_changed)
    });

  let _sessions = await Session.find().catch(err =>
    functions.handle(err, '/core/routers/admin.js')
  );
  _sessions = _sessions.sort((a, b) => b.timestamp - a.timestamp);

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
      created_at: functions.parseDate(created_at)
    });
  }

  let exerciseCategories = await ExerciseCategory.find().catch(err =>
    functions.handle(err, '/core/routers/admin.js')
  );
  exerciseCategories = exerciseCategories.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });

  const exercise_categories = [];
  for (let exerciseCategory of exerciseCategories) {
    const { title, id, last_changed } = exerciseCategory;

    const exercises = await Exercise.find({ category_id: id }).catch(err =>
      functions.handle(err, '/core/routers/admin.js')
    );

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
        created_at: functions.parseDate(created_at),
        last_changed: functions.parseDate(last_changed),
        published
      });
    }

    exercise_categories.push({
      title,
      id,
      last_changed: functions.parseDate(last_changed),
      exercises: category_exercises
    });
  }

  res.render('admin/index', {
    categories,
    users,
    feedback,
    sessions,
    achievements,
    exercise_categories
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
  const { title, id, category } = req.body;

  if (title && id && category) {
    await Exercise.create({
      id,
      title,
      category_id: category,
      data: JSON.parse(
        fs.readFileSync('./data/exercise_data_boilerplate.json').toString()
      ),
      metadata: {},
      created_at: new Date(),
      last_changed: new Date()
    })
      .then(() => res.redirect('/admin/#ulesanded'))
      .catch(err => functions.handle(err, '/core/routers/admin.js'));
  } else res.redirect('/admin/#ulesanded');
});

router.route('/del_exe').post(async (req, res) => {
  const { id } = req.body;

  if (id) {
    const ids = id.split(':');
    const cat_id = ids[0],
      exe_id = ids[1];

    if (exe_id && cat_id) {
      await Exercise.deleteOne({ id: exe_id, category_id: cat_id })
        .then(() => res.redirect('/admin/#ulesanded'))
        .catch(err => functions.handle(err, '/core/routers/admin.js'));
    } else res.redirect('/admin/#ulesanded');
  } else res.redirect('/admin/#ulesanded');
});

router.route('/edit_exercise/:id').get(async (req, res) => {
  const { id } = req.params;
  if (id) {
    const ids = id.split(':');
    const cat_id = ids[0],
      exe_id = ids[1];

    if (cat_id && exe_id) {
      const exercise = await Exercise.find({ id: exe_id, category_id: cat_id })
        .then(data => data[0])
        .catch(err => functions.handle(err, '/core/routers/admin.js'));

      if (exercise === null || exercise === undefined)
        res.redirect('/admin/#ulesanded');

      res.render('admin/edit_exercise', {
        exercise,
        cat_id
      });
    } else res.redirect('/admin/#ulesanded');
  } else res.redirect('/admin/#ulesanded');
});

router.route('/edit_exercise/:id').post(async (req, res) => {
  const { id } = req.params;
  const { title, data } = req.body;
  if (id && title && data) {
    const ids = id.split(':');
    const cat_id = ids[0],
      exe_id = ids[1];

    if (cat_id && exe_id) {
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

      const exercise = await Exercise.find({ id: exe_id, category_id: cat_id })
        .then(data => data[0])
        .catch(err => functions.handle(err, '/core/routers/admin.js'));

      if (exercise === null || exercise === undefined)
        res.redirect('/admin/#ulesanded');

      res.render('admin/edit_exercise', {
        exercise,
        cat_id
      });
    } else res.redirect('/admin/#ulesanded');
  } else res.redirect('/admin/#ulesanded');
});

router.route('/set_exe_published').post(async (req, res) => {
  const { id, state } = req.body;

  console.log(req.body);
  if (id && state) {
    const ids = id.split(':');
    const cat_id = ids[0],
      exe_id = ids[1];
    console.log(state);

    if (cat_id && exe_id) {
      await Exercise.updateOne(
        { id: exe_id, category_id: cat_id },
        {
          $set: {
            published: state === 'on' ? true : false
          }
        }
      )
        .then(() => res.redirect('/admin/#ulesanded'))
        .catch(err => functions.handle(err, '/core/routers/admin.js'));
    } else res.redirect('/admin/#ulesanded');
  } else res.redirect('/admin/#ulesanded');
});

router.route('/test').get((req, res) => {
  const data = [
    ['Task', 'Hours per Day'],
    ['Work', 11],
    ['Eat', 2],
    ['Commute', 2],
    ['Watch TV', 2],
    ['Sleep', 7]
  ];

  const options = {
    title: 'My Daily Activities'
  };

  res.render('admin/test', {
    data: JSON.stringify(data),
    options: JSON.stringify(options)
  });
});

module.exports = router;
