const port = 80;

const express = require('express');
const router = express.Router();

const fs = require('fs');

const authModule = require('../modules/authModule');

const functions = require('../functions');
const database = require('../modules/firebase/database');

const showdown = require('showdown');
const mathjax = require('mathjax-node');
mathjax.config({
  MathJax: {
    fontURL:
      'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/fonts/HTML-CSS'
  }
});
mathjax.start();

router.route('/').get(async (req, res) => {
  res.render('index', {
    selectedTopic: null,
    selectedField: null
  });
});

router.route('/test').get((req, res) => {
  /* const converter = new showdown.Converter({
    optionKey: 'value'
  });
  const md = fs
    .readFileSync(__dirname + '/../../data/markdowns/test.MD')
    .toString(); */
  const expression = '\\cos(θ+φ)=\\cos(θ)\\cos(φ)−\\sin(θ)\\sin(φ)';
  mathjax.typeset(
    {
      math: expression,
      format: 'TeX',
      svg: true
    },
    data => {
      if (!data.errors) res.render('test', { data: data.svg });
      else console.log(data.errors);
    }
  );
});

const log = (req, res, next) => {
  console.log(
    functions.currentTime() +
      ' [WEB, ' +
      req.method +
      '] ' +
      req.protocol +
      '://' +
      req.hostname +
      req.url
  );
  next();
};

module.exports = {
  router,
  port,
  log
};
