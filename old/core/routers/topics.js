const router = require('express').Router();

const fs = require('fs');

const { prisma } = require('../prisma/generated/prisma-client/index');

router.get('/:categoryId', async (req, res) => {
  const { categoryId } = req.params;

  const category = await prisma
    .category({ displayId: categoryId })
    .$fragment(
      `
    fragment CategoryTopics on Category {
      displayId,
      title,
      topics {
        displayId,
        title
      }
    }
    `
    )
    .catch(err => console.error(err));

  if (category) {
    res.render('topics/topics', { category });
  } else {
    //! Näita 404
    res.redirect('/teemad/');
  }
});

router.get('/f/:topicId', async (req, res) => {
  const { topicId } = req.params;

  const topic = await prisma
    .topic({
      displayId: topicId
    })
    .$fragment(
      `
    fragment TopicData on Topic {
      displayId
      title
      category {
        displayId
        title
      }
    }
    `
    )
    .catch(err => console.error(err));

  if (topic) {
    fs.readFile(`./data/materials/${topicId}.txt`, (err, data) => {
      const html = data.toString();
      res.render('topics/topic', { topic, html });
    });
  } else {
    //! Näita 404
    res.redirect('/teemad/');
  }
});

module.exports = router;
