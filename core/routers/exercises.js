const router = require('express').Router();

const Exercise = require('../database/models/Exercise');

const exerciseModule = require('../modules/exerciseModule');

router.route('/').get(async (req, res) => {
  const exercises = await Exercise.find();

  res.render('exercises/all', { exercises });
});

router.route('/:categoryId*/:exerciseId*').get(async (req, res) => {
  const { categoryId, exerciseId } = req.params;

  const exercise = await Exercise.findOne({
    id: exerciseId,
    category_id: categoryId
  });

  if (exercise != null) {
    if (exercise.published) {
      if (exercise.type == 'exercise') {
        const data = exerciseModule.generateExercise(
          exercise.variables,
          exercise.variants
        );
        data.answer = Buffer.from(data.answer.toString()).toString('base64');

        res.render(`exercises/${exercise.type}.ejs`, { exercise, data });
      } else {
        res.render(`exercises/quiz.ejs`, { exercise });
      }
    } else {
      res.render('exercises/not_published.ejs');
    }
  } else res.status(404).send('Ülesannet ei leitud.');
});
router.route('/submit').post(async (req, res) => {
  const { correct_answer: _correct_answer, answer: _answer } = req.body;

  if (_correct_answer && _answer) {
    const correct_answer = Buffer.from(_correct_answer, 'base64').toString(
      'ascii'
    );
    const answer = _answer.replace(/,/g, '.');

    res.send({ correct: correct_answer == answer, correct_answer, answer });
  } else res.status(400).send('Valesti saadetud andmed!');
});

module.exports = router;
