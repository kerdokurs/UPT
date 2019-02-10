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

  let topicData = await getTopicData(topicId, categoryId);
  let categoryData = await getCategoryData(categoryId);

  let bookmarked = false;

  if (authModule.isUserLoggedIn(req)) {
    const bookmarkId = categoryId + '-' + topicId;
    const session = await authModule.getSession(req);
    const { uid } = session || {};

    const data = await Bookmark.find({ uid, id: bookmarkId })
      .then(data => data)
      .catch(err => functions.handle(err, '/core/routers/topics.js'));
    bookmarked = data.length > 0;
  }

  const _category = res.locals._categories.filter(
    cat => cat.id == categoryId
  )[0];

  if (_category == null) return res.redirect('/');

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
});

async function getTopicData(topicId, categoryId) {
  return await Topic.find({ id: topicId, parent: categoryId })
    .then(data => data[0])
    .catch(err => functions.handle(err, '/core/routers/topics.js'));
}

async function getCategoryData(categoryId) {
  return await Category.find({ id: categoryId })
    .then(data => data[0])
    .catch(err => functions.handle(err, '/core/routers/topics.js'));
}

function generateMarkdown(data) {
  let markdown;
  try {
    const converter = new showdown.Converter({
      optionKey: 'value',
      customizedHeaderId: true,
      tables: true,
      openLinksInNewWindow: true,
      headerLevelStart: 3
    });
    converter.setFlavor('github');
    markdown = converter.makeHtml(data);

    //Parse MathJax and insert it into topic HTML markdown.
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
  } catch (err) {}
  return markdown;
}

module.exports = router;
