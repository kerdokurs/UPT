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

router.route('/:topicId?/:fieldId*?').get(async (req, res) => {
  const { topicId, fieldId } = req.params;

  const topic = functions.getTopic(topicId);
  const field = functions.getField(topic, fieldId);

  let bookmarked = false;

  if (authModule.isUserLoggedIn(req)) {
    const bookmarkId = topicId + '-' + fieldId;
    const { uid } = req.cookies;

    await Bookmark.find({ uid, id: bookmarkId }, (err, data) => {
      if (data.length > 0) bookmarked = true;
    });
  }

  if (topic && field) {
    const data = await generateMarkdown(topic, field);
    res.render('topics/topic', {
      selectedTopic: topic,
      selectedField: field,
      data,
      bookmarked,
      pathname: req.path
    });
  } else if (topic && !field) {
    res.render('topics/topics', {
      selectedTopic: topic
    });
  } else {
    res.render('topics/topics', { selectedTopic: null });
  }
});

function getFiles(topic, field) {
  let data = '';
  if (topic) {
    if (field) {
      data = topic.id + '/' + field.id;
    } else {
      data = topic.id + '/index';
    }
  } else {
    data = 'index';
  }
  return data;
}

function generateMarkdown(topic, field) {
  let markdown;
  try {
    const data = getFiles(topic, field);
    markdown = fs
      .readFileSync(__dirname + `/../../data/topics/${data}.md`)
      .toString();

    const converter = new showdown.Converter({
      optionKey: 'value',
      customizedHeaderId: true,
      tables: true,
      openLinksInNewWindow: true,
      headerLevelStart: 3
    });
    markdown = converter.makeHtml(markdown);

    //Parse MathJax and insert it into topic HTML markdown.
    const regex = /\$.*?\$/g;
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
