const router = require('express').Router();

const fs = require('fs');

const showdown = require('showdown');

const mathjax = require('mathjax-node');
mathjax.config({
  MathJax: {
    fontURL:
      'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/fonts/HTML-CSS'
  }
});
mathjax.start();

const functions = require('../functions');
const authModule = require('../modules/authModule');

const Bookmark = require('../database/models/Bookmark');
const Category = require('../database/models/Category');
const Topic = require('../database/models/Topic');

router.route('/:categoryId?/:topicId*?').get(async (req, res) => {
  const { categoryId, topicId } = req.params;

  if (categoryId && topicId) {
    let topicData = await getTopicData(topicId, categoryId);
    let categoryData = await getCategoryData(categoryId);

    if (!topicData || !categoryData) return res.redirect('/teemad/');

    let bookmarked = false;

    if (authModule.isUserLoggedIn(req)) {
      const bookmarkId = categoryId + '-' + topicId;
      const session = await authModule.getSession(req);
      const { uid } = session || {};

      const data = await Bookmark.find({ uid, id: bookmarkId }).catch(err =>
        functions.handle(err, '/core/routers/topics.js')
      );
      bookmarked = data.length > 0;
    }

    const _category = res.locals._categories.filter(
      cat => cat.id == categoryId
    )[0];

    categoryData.topics = _category.topics;

    if (categoryData && topicData) {
      const markdown = generateMarkdown(topicData.data);
      res.render('topics/topic', {
        category: categoryData,
        topic: topicData,
        markdown,
        bookmarked,
        pathname: req.path
      });
    } else if (categoryData && !topicData) {
      res.render('topics/topics', {
        category: categoryData
      });
    } else {
      res.render('topics/topics', {
        category: {}
      });
    }
  } else {
    res.render('topics/index');
  }
});

async function getTopicData(topicId, categoryId) {
  return await Topic.findOne({ id: topicId, parent: categoryId }).catch(err =>
    functions.handle(err, '/core/routers/topics.js')
  );
}

async function getCategoryData(categoryId) {
  return await Category.findOne({ id: categoryId }).catch(err =>
    functions.handle(err, '/core/routers/topics.js')
  );
}

//! Millegi tõttu esimese laadimise peal MathJax ei laadi.
function generateMarkdown(data) {
  let markdown;
  try {
    const converter = new showdown.Converter({
      optionKey: 'value',
      customizedHeaderId: true,
      tables: true,
      headerLevelStart: 3
    });
    converter.setFlavor('github');
    markdown = converter.makeHtml(data);

    const regex = /\$.*?\$/gs;
    const finds = [];
    let find;

    do {
      find = regex.exec(markdown);
      if (find) finds.push(find);
    } while (find);

    for (let find of finds) {
      let string = find[0];
      string = string.substring(1, string.length - 1);

      mathjax.typeset(
        {
          math: string,
          format: 'inline-TeX',
          svg: true
        },
        data => {
          markdown = markdown.toString().replace(find[0], data.svg);
        }
      );
    }
  } catch (err) {
    functions.handle(err, '/core/routers/topics.js');
  }
  return markdown;
}

module.exports = router;
