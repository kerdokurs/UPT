const router = require('express').Router();

const fs = require('fs');

const authModule = require('../modules/authModule');
const exerciseModule = require('../modules/exerciseModule');

const Exercise = require('../database/models/Exercise');
const Quiz = require('../database/models/Quiz');
const QuizVerifier = require('../database/models/QuizVerifier');
const SolvedExercise = require('../database/models/SolvedExercise');
const ExerciseVerifier = require('../database/models/ExerciseVerifier');
const ExerciseRevision = require('../database/models/ExerciseRevision');
const ExerciseCategory = require('../database/models/ExerciseCategory');

const User = require('../database/models/User');

const functions = require('../functions');

const applyAchievements = async uid => {
  await authModule.grantAchievement(uid, 'ulesanne1');

  const user = await User.findOne({ uid });

  if (user.metadata.completed_exercises == 5)
    await authModule.grantAchievement(uid, 'ulesanne5');
  else if (user.metadata.completed_exercises == 10)
    await authModule.grantAchievement(uid, 'ulesanne10');
  else if (user.metadata.completed_exercises == 100)
    await authModule.grantAchievement(uid, 'ulesanne100');
};

const updateUserRatio = async uid => {
  const _user = await User.findOne({ uid }).catch(err =>
    functions.handle(err, '/core/routers/exercises.js')
  );

  const ratio = (
    parseFloat(_user.metadata.exercise_points) /
    parseFloat(_user.metadata.completed_exercises)
  ).toFixed(2);

  await User.updateOne(
    { uid },
    {
      $set: {
        'metadata.ratio': ratio
      }
    }
  );
};

router.route('/').get(async (req, res) => {
  const categories = await ExerciseCategory.find();

  const data = [];
  for (const category of categories) {
    const { id, title } = category;

    const exercises = await Exercise.find({ category_id: id }).catch(err =>
      functions.handle(err, '/core/routers/exercises.js')
    );
    const quizzes = await Quiz.find({ category_id: id }).catch(err =>
      functions.handle(err, '/core/routers/exercises.js')
    );

    data.push({
      id,
      title,
      exercises,
      quizzes
    });
  }

  res.render('exercises/all', { data });
});

router.route('/astmed').get(async (req, res) => {
  const data = await exerciseModule.astmed.generate();

  res.render('exercises/astmed', { data });
});

router.route('/astmed').post(async (req, res) => {
  const { uid } = await authModule.getLoggedUser(req);

  const tree = JSON.parse(
    fs.readFileSync(__dirname + '/../../data/kymne-astmed.json').toString()
  );

  let points = 0,
    corrects = 0;
  const data = [];
  for (let i = 0; i < 12; i++) {
    const token = req.body['f' + i + '-token'],
      power = req.body['f' + i + '-power'],
      name = req.body['f' + i + '-name'],
      provided = req.body['f' + i + '-provided'];

    const obj = getFromTree(
      tree,
      provided,
      provided == 'token' ? token : provided == 'power' ? power : name
    );

    const isCorrect =
      token == obj.token && power == obj.power && name == obj.name;

    if (isCorrect) {
      points += 1;
      corrects += 1;
    } else {
      points -= 1;
    }

    data.push({
      token,
      power,
      name,
      obj,
      isCorrect
    });
  }

  if (uid) {
    const rid = functions.randomString(24);

    await ExerciseRevision.create({
      id: rid,
      uid: uid || '',
      type: 'astmed',
      title: 'Astmed',
      created_at: new Date(),
      data: { data, points }
    }).catch(err => functions.handle(err, '/core/routers/exercises.js'));

    await SolvedExercise.create({
      id: functions.randomString(24),
      uid,
      eid: 'astmed',
      rid,
      type: 'a',
      title: 'Astmed',
      solved: points >= 0,
      points: points,
      timestamp: new Date(),
      data: {
        corrects,
        total: 12
      }
    }).catch(err => functions.handle(err, '/core/routers/exercises.js'));

    await User.updateOne(
      { uid },
      {
        $inc: {
          'metadata.completed_exercises': 1,
          'metadata.exercise_points': points
        }
      }
    ).catch(err => functions.handle(err, '/core/routers/exercises.js'));

    await updateUserRatio(uid);
  }

  res.render('exercises/astmed_done', { data, points });
});

router.route('/lahendatud').get(async (req, res) => {
  const { uid } = await authModule.getLoggedUser(req);
  if (!uid) {
    res.redirect('/user/login?next=/ulesanded/lahendatud');
    return;
  }

  const solvedExercises = await SolvedExercise.find({ uid })
    .sort({ timestamp: 'desc' })
    .catch(err => functions.handle(err, '/core/routers/exercises.js'));
  const user = await User.findOne({ uid }).catch(err =>
    functions.handle(err, '/core/routers/exercises.js')
  );

  res.render('exercises/solved_exercises', {
    solvedExercises,
    user
  });
});

router.route('/:type/:id').get(async (req, res) => {
  exerciseModule.deleteVerifiers();
  const { id, type } = req.params;
  const ids = id.split(':');
  const cat_id = ids[0],
    exe_id = ids[1];

  if (type == 'e') {
    const exercise = await Exercise.findOne({
      category_id: cat_id,
      id: exe_id
    }).catch(err => functions.handle(err, '/core/routers/exercises.js'));
    if (exercise != null) {
      if (!exercise.published) {
        res.status(400).render('exercises/not_published');
      }

      exercise.data = exerciseModule.generate(exercise.data);

      const o_id = functions.randomString(24);
      await ExerciseVerifier.create({
        id: o_id,
        e_id: id,
        created_at: new Date(),
        valid_for: exercise.data.time_limit || 300,
        variables: exercise.data.variables,
        formula: exercise.data.formula,
        answer: exercise.data.answer,
        points: exercise.data.points,
        variant: exercise.data.variantId
      });

      res.render('exercises/index', { exercise, o_id });
    } else res.redirect('/');
  } else if (type == 'q') {
    const quiz = await Quiz.findOne({ category_id: cat_id, id: exe_id });

    if (quiz != null) {
      if (!quiz.published) {
        res.status(400).render('exercises/not_published');
      }

      const qvid = functions.randomString(24);

      quiz.data = exerciseModule.quiz.generate(quiz.data);

      await QuizVerifier.create({
        id: qvid,
        e_id: id,
        created_at: new Date(),
        valid_for: quiz.data.time_limit,
        data: quiz.data
      }).catch(err => functions.handle(err, '/core/routers/exercises.js'));

      res.render('exercises/quiz', { quiz, qvid });
    } else res.redirect('/');
  } else res.redirect('/'); // TODO: Mõtle korralik süsteem.
});

router.route('/:type/:id/submit').post(async (req, res) => {
  const { id, type } = req.params;
  const { uid } = await authModule.getLoggedUser(req);

  if (type == 'e') {
    const { o_id, answer } = req.body;

    if (!answer && !o_id) {
      res.status(403).send(
        JSON.stringify({
          code: 403,
          msg: 'Invalid parameters.'
        })
      );
      return;
    }

    const verifier = await ExerciseVerifier.findOne({
      id: o_id,
      e_id: id
    }).catch(err => functions.handle(err, '/core/routers/exercises.js'));

    const ids = verifier.e_id.split(':');
    const cat_id = ids[0],
      exe_id = ids[1];
    const exercise = await Exercise.findOne({
      id: exe_id,
      category_id: cat_id
    }).catch(err => functions.handle(err, '/core/routers/exercises.js'));

    const isCorrect = answer == (verifier != null ? verifier.answer : false);

    const se = functions.randomString(24);

    const pointsToAward =
      (exercise.data.points || 20) * (isCorrect ? 1 : -0.25);

    if (uid) {
      await SolvedExercise.create({
        id: se,
        uid,
        eid: id,
        type: 'e',
        title: exercise.title,
        solved: isCorrect,
        points: pointsToAward,
        timestamp: new Date(),
        data: {}
      }).catch(err => functions.handle(err, '/core/routers/exercises.js'));

      await User.updateOne(
        { uid },
        {
          $inc: {
            'metadata.completed_exercises': 1,
            'metadata.exercise_points': pointsToAward
          }
        }
      ).catch(err => functions.handle(err, '/core/routers/exercises.js'));

      await updateUserRatio(uid);
      await applyAchievements(uid);
    }

    await ExerciseVerifier.deleteOne({ id: o_id, e_id: id }).catch(err =>
      functions.handle(err, '/core/routers/exercises.js')
    );

    res.render('exercises/exercise_done', {
      isCorrect,
      points: pointsToAward,
      answer,
      correctAnswer: verifier.answer,
      formula: exercise.data.formula,
      exercise
    });
  } else if (type == 'q') {
    const { qvid } = req.body;
    const verifier = await QuizVerifier.findOne({ id: qvid }).catch(err =>
      functions.handle(err, '/core/routers/exercises.js')
    );
    const ids = verifier.e_id.split(':');
    const cat_id = ids[0],
      quiz_id = ids[1];
    const quiz = await Quiz.findOne({ id: quiz_id, category_id: cat_id }).catch(
      err => functions.handle(err, '/core/routers/exercises.js')
    );

    if (verifier) {
      const data = exerciseModule.quiz.verify(verifier, req.body);

      let points = 0,
        corrects = 0,
        total = data.length;
      for (obj of data) {
        if (obj.correct) {
          corrects += 1;
          points += obj.points;
        }
      }

      const se = functions.randomString(24);

      await QuizVerifier.deleteOne({ id: qvid }).catch(err =>
        functions.handle(err, '/core/routers/exercises.js')
      );

      if (uid) {
        await SolvedExercise.create({
          id: se,
          uid,
          type: 'q',
          eid: verifier.e_id,
          title: quiz.title,
          solved: true,
          points,
          timestamp: new Date(),
          data: {
            corrects,
            total
          }
        }).catch(err => functions.handle(err, '/core/routers/exercises.js'));

        await User.updateOne(
          { uid },
          {
            $inc: {
              'metadata.completed_exercises': 1,
              'metadata.exercise_points': points
            }
          }
        ).catch(err => functions.handle(err, '/core/routers/exercises.js'));

        await updateUserRatio(uid);
        await applyAchievements(uid);
      }

      res.render('exercises/quiz_done', {
        quiz,
        vars: { points, corrects, total },
        data
      });
    } else res.redirect('/');
  } else res.redirect('/');
});

router.use(authModule.loginGuard);

router.route('/edetabel').get(async (req, res) => {
  const { uid } = await authModule.getLoggedUser(req);

  const users = await User.find({
    'metadata.ratio': { $ne: null, $ne: 'NaN' },
    allow_leaderboard: true
  })
    .sort({ 'metadata.ratio': -1 })
    .limit(100)
    .catch(err => functions.handle(err, '/core/routers/exercises.js'));

  res.render('exercises/leaderboard', { uid, users });
});

router.route('/vaata/:id').get(async (req, res) => {
  const { id } = req.params;

  const exerciseRevision = await ExerciseRevision.findOne({ id }).catch(err =>
    functions.handle(err, '/core/routers/exercises.js')
  );
  res.send('<pre>' + JSON.stringify(exerciseRevision, null, 2) + '</pre>');
});

module.exports = router;

function getFromTree(tree, id, key) {
  for (const el of tree) if (el[id] == key) return el;
  return null;
}
