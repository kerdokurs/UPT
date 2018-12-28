const router = require('express').Router();

const authModule = require('../modules/authModule');
const functions = require('../functions');

const StudentClass = require('../database/models/StudentClass');
const User = require('../database/models/User');

router.use(authModule.teacherGuard);

router.route('/').get(async (req, res) => {
  const user = await authModule.getLoggedUser(req);
  const _classes = await StudentClass.find({ teacher: user.uid });
  const classes = await _classes.map(async cl => {
    const { students } = cl;
  });

  res.render('teacher/index', { classes });
});

router.route('/add_class').post(async (req, res) => {
  const { title } = req.body;
  const { uid } = await authModule.getSession(req);

  StudentClass.create({
    id: functions.randomString(24),
    title,
    teacher: uid,
    students: [],
    created_at: new Date(),
    last_changed: new Date()
  }).then(() => {
    res.redirect('/op');
  });
});

module.exports = router;
