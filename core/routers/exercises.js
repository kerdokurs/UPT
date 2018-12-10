const router = require('express').Router();

const authModule = require('../modules/authModule');
const exerciseModule = require('../modules/exerciseModule');

const Exercise = require('../database/models/Exercise');
const ExerciseVerifierObject = require('../database/models/ExerciseVerifierObject');

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

router.route('/:id').get(async (req, res) => {
  const { id } = req.params;
  let exercise = await Exercise.find({ id })
    .then(data => data[0])
    .catch(err => functions.handle(err, '/core/routers/exercises.js'));
  exercise.data = await exerciseModule.generate(exercise.data);

  const o_id = functions.randomString(24);
  await ExerciseVerifierObject.create({
    id: o_id,
    e_id: id,
    created_at: new Date(),
    valid_for: 1,
    variables: exercise.data.variables,
    formula: exercise.data.formula,
    answer: exercise.data.answer
  });

  res.render('exercises/index', { exercise, o_id });
});

router.route('/:id/submit').post(async (req, res) => {
  const { id } = req.params;
  const { o_id, answer } = req.body;

  const verifier = await ExerciseVerifierObject.find({ id: o_id, e_id: id })
    .then(data => data[0])
    .catch(err => functions.handle(err, '/core/routers/exercises.js'));

  const isCorrect = answer == verifier.answer;

  if (isCorrect) {
    await ExerciseVerifierObject.deleteOne({ id: o_id, e_id: id });
    const { uid, metadata } = await authModule.getLoggedUser(req);
    await User.find(
      { uid },
      {
        $set: {
          metadata: {
            completed_exercises: (metadata.completed_exercises || 0) + 1
          }
        }
      }
    );
    res.send('correct');
  } else {
    res.send('incorrect');
  }
});

module.exports = router;
