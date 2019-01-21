const router = require('express').Router();

const authModule = require('../modules/authModule');
const exerciseModule = require('../modules/exerciseModule');

const Exercise = require('../database/models/Exercise');
const Quiz = require('../database/models/Quiz');
const QuizVerifier = require('../database/models/QuizVerifier');
const SolvedExercise = require('../database/models/SolvedExercise');
const ExerciseVerifier = require('../database/models/ExerciseVerifier');

const User = require('../database/models/User');

const functions = require('../functions');

router.use(authModule.loginGuard);

router.route('/').get(async (req, res) => {
  res.send('ÜLESANDED.');
});

router.route('/astmed').get(async (req, res) => {
  const data = await exerciseModule.astmed.generate();

  res.render('exercises/astmed', { data });
});

router.route('/astmed').post(async (req, res) => {
  res.send('<pre>' + JSON.stringify(req.body, null, 2) + '</pre>');
});

router.route('/lahendatud').get(async (req, res) => {
  const { uid } = await authModule.getLoggedUser(req);
  const solvedExercises = await SolvedExercise.find({ uid })
    .sort({ timestamp: 'desc' })
    .then(data => data);

  res.render('exercises/solved_exercises', {
    solvedExercises
  });
});

router.route('/edetabel').get(async (req, res) => {
  const { uid } = await authModule.getLoggedUser(req);
  const users = await User.find()
    .sort({ 'metadata.exercise_points': -1 })
    .limit(100);

  res.render('exercises/leaderboard', { uid, users });
});

router.route('/:type/:id').get(async (req, res) => {
  const { id, type } = req.params;
  const ids = id.split(':');
  const cat_id = ids[0],
    exe_id = ids[1];

  if (type == 'e') {
    const exercise = await Exercise.find({ category_id: cat_id, id: exe_id })
      .then(data => data[0])
      .catch(err => functions.handle(err, '/core/routers/exercises.js'));
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
    const quiz = await Quiz.find({ category_id: cat_id, id: exe_id }).then(
      data => data[0]
    );

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
      });

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

    const verifier = await ExerciseVerifier.find({ id: o_id, e_id: id })
      .then(data => data[0])
      .catch(err => functions.handle(err, '/core/routers/exercises.js'));

    const ids = verifier.e_id.split(':');
    const cat_id = ids[0],
      exe_id = ids[1];
    const exercise = await Exercise.find({ id: exe_id, category_id: cat_id })
      .then(data => data[0])
      .catch(err => functions.handle(err, '/core/routers/exercises.js'));

    const isCorrect = answer == (verifier != null ? verifier.answer : false);

    const se = functions.randomString(24);

    const pointsToAward =
      (exercise.data.points || 20) * (isCorrect ? 1 : -0.25);

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
    });

    await ExerciseVerifier.deleteOne({ id: o_id, e_id: id });
    await User.updateOne(
      { uid },
      {
        $inc: {
          'metadata.completed_exercises': 1,
          'metadata.exercise_points': pointsToAward
        }
      }
    );
    if (isCorrect) {
      res.send(
        JSON.stringify({
          points: pointsToAward,
          answer,
          correctAnswer: verifier.answer,
          formula: exercise.data.formula,
          msg: `Õigesti lahendatud! Teenisid <answer> punkti!`
        })
      );
    } else {
      // TODO: Info nagu peale quizi.
      // TODO: Lisa lahendatud ülesannete andmed andmebaasi hiljemaks ülevaateks!
      res.send({
        answer,
        correctAnswer: verifier.answer,
        points: pointsToAward,
        formula: exercise.data.formula,
        msg: `Midagi oli valesti. Õige vastus oli: <answer>. Kaotasid <points> punkte.`
      });
    }
  } else if (type == 'q') {
    const { qvid } = req.body;
    const verifier = await QuizVerifier.find({ id: qvid }).then(
      data => data[0]
    );
    const ids = verifier.e_id.split(':');
    const cat_id = ids[0],
      quiz_id = ids[1];
    const quiz = await Quiz.findOne({ id: quiz_id, category_id: cat_id });

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
      });

      await QuizVerifier.deleteOne({ id: qvid });

      await User.updateOne(
        { uid },
        {
          $inc: {
            'metadata.completed_exercises': 1,
            'metadata.exercise_points': points
          }
        }
      );

      res.render('exercises/quiz_done', {
        quiz,
        vars: { points, corrects, total },
        data
      });
    } else res.redirect('/');
  } else res.redirect('/');
});

module.exports = router;
