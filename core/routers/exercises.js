const router = require('express').Router();

const authModule = require('../modules/authModule');
const exerciseModule = require('../modules/exerciseModule');

const Exercise = require('../database/models/Exercise');
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
  res.send('jah.');
});

router.route('/:id').get(async (req, res) => {
  const { id } = req.params;
  const ids = id.split(':');
  const cat_id = ids[0],
    exe_id = ids[1];
  let exercise = await Exercise.find({ category_id: cat_id, id: exe_id })
    .then(data => data[0])
    .catch(err => functions.handle(err, '/core/routers/exercises.js'));
  if (exercise != null) {
    if (!exercise.published) {
      res.status(400).render('exercises/not_published');
    }

    exercise.data = await exerciseModule.generate(exercise.data);

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
});

router.route('/:id/submit').post(async (req, res) => {
  const { id } = req.params;
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

  await ExerciseVerifier.deleteOne({ id: o_id, e_id: id });
  if (isCorrect) {
    const { uid } = await authModule.getLoggedUser(req);
    await User.updateOne(
      { uid },
      {
        $inc: {
          'metadata.completed_exercises': 1,
          'metadata.exercise_points': exercise.data.points || 20
        }
      }
    );
    res.send(
      JSON.stringify({
        points: exercise.data.points,
        answer,
        formula: exercise.data.formula,
        msg: `Õigesti lahendatud! Teenisid <answer> punkti!`
      })
    );
  } else {
    res.send({
      answer,
      formula: exercise.data.formula,
      msg: `Midagi oli valesti. Õige vastus oli: <answer>.`
    });
  }
});

module.exports = router;
