const fs = require('fs');

const Category = require('./database/models/Category');
const Topic = require('./database/models/Topic');

const User = require('./database/models/User');

const randomString = length => {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

const getCategories = async () => {
  const categories = await Category.find().catch(err =>
    handle(err, '/core/functions.js')
  );
  const topics = await Topic.find().catch(err =>
    handle(err, '/core/functions.js')
  );

  const _categories = [];

  for (let category of categories) {
    const _category = {
      title: category.title,
      id: category.id,
      topics: []
    };

    for (let topic of topics) {
      const _topic = {
        title: topic.title,
        id: topic.id
      };

      if (topic.parent === category.id) {
        _category.topics.push(_topic);
      }
    }

    _categories.push(_category);
  }

  return _categories;
};

const handle = (err, path) => {
  const date = parseDate(new Date());

  console.log(`Error: [${path}, ${date}] > ${err}`);
  fs.appendFile(
    `../../errors/${currentDate()}.log`,
    `${date} ${path} > ${err}\n`,
    err => {
      if (err) console.error(err);
    }
  );
};

const shuffleArray = array => {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

const parseDate = date => {
  let hours = parseInt(date.getHours());
  if (parseInt(hours) < 10) hours = '0' + hours;

  let minutes = date.getMinutes();
  if (parseInt(minutes) < 10) minutes = '0' + minutes;

  let seconds = date.getSeconds();
  if (parseInt(seconds) < 10) seconds = '0' + seconds;

  let day = date.getDate();
  if (parseInt(day) < 10) day = '0' + day;

  let month = date.getMonth() + parseInt(process.env.MONTH_OFFSET || 0);
  if (parseInt(month) < 10) month = '0' + month;

  let year = date
    .getFullYear()
    .toString()
    .substr(2, 2);
  if (parseInt(year) < 10) year = '0' + year;

  return `[${hours}:${minutes}:${seconds} ${day}/${month}/${year}]`;
};

const currentDate = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth() + parseInt(process.env.MONTH_OFFSET || 0);
  const day = now.getDate();

  return `${year}-${month}-${day}`;
};

const randomHexString = () => {
  const possible = '0123456789abcdef';
  let text = '';
  for (let i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

const parseParams = (req, res, next) => {
  const redir = req.query.next || '/';
  const ref = req.query.ref;
  req.redir = redir;
  req.ref = ref;
  next();
};

module.exports = {
  randomString,
  parseDate,
  currentDate,

  getCategories,

  handle,

  shuffleArray,
  randomHexString,

  parseParams
};
