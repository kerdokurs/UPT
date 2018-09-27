const router = require('express').Router();

const authModule = require('../modules/authModule');

const functions = require('../functions');

router.route('/:topicId?/:fieldId*?').get(async (req, res) => {
  const { topicId, fieldId } = req.params;

  const topic = functions.getTopic(topicId);
  const field = functions.getField(topic, fieldId);

  res.render('teemad/teema', {
    selectedTopic: topic,
    selectedField: field
  });
});

module.exports = router;
