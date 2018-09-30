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

router.route('/:topicId?/:fieldId*?').get(async (req, res) => {
  const { topicId, fieldId } = req.params;

  const topic = functions.getTopic(topicId);
  const field = functions.getField(topic, fieldId);

  if (topic && field) {
    res.render('topics/topic', {
      selectedTopic: topic,
      selectedField: field,
      data: generateMarkdown(topic, field)
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
      customizedHeaderId: true
    });
    markdown = converter.makeHtml(markdown);

    //Parse MathJax and insert it into topic HTML markdown.
    const config = JSON.parse(
      fs.readFileSync(__dirname + `/../../data/topics/${data}.json`).toString()
    );
    const mj = config.mathjax;

    mj.forEach(obj => {
      mathjax.typeset(
        {
          math: obj.exp,
          format: 'TeX',
          svg: true
        },
        data => {
          if (!data.errors)
            markdown = markdown.replace(
              new RegExp('%' + obj.id + '%', 'g'),
              data.svg
            );
          else console.log(data.errors);
        }
      );
    });
  } catch (err) {}
  return markdown;
}

module.exports = router;
