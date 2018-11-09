const fs = require('fs');

const Category = require('./database/models/Category');
const Topic = require('./database/models/Topic');

const randomString = length => {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

const currentTime = () => {
  const now = new Date();

  let hours =
    parseInt(now.getHours()) + parseInt(process.env.TIME_HOUR_OFFSET || '1');
  if (parseInt(hours) < 10) hours = '0' + hours;

  let minutes = now.getMinutes();
  if (parseInt(minutes) < 10) minutes = '0' + minutes;

  let seconds = now.getSeconds();
  if (parseInt(seconds) < 10) seconds = '0' + seconds;

  let day = now.getDate();
  if (parseInt(day) < 10) day = '0' + day;

  let month =
    parseInt(now.getMonth()) + parseInt(process.env.TIME_MONTH_OFFSET || '3');
  if (parseInt(month) < 10) month = '0' + month;

  let year = now
    .getFullYear()
    .toString()
    .substr(2, 2);
  if (parseInt(year) < 10) year = '0' + year;

  return (
    '[' +
    hours +
    ':' +
    minutes +
    ':' +
    seconds +
    ' ' +
    day +
    '/' +
    month +
    '/' +
    year +
    ']'
  );
};

const getTopics = async () => {
  const categories = await Category.find();
  const topics = await Topic.find();

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

const getStatus = id => {
  const status = JSON.parse(
    fs.readFileSync(__dirname + '/../data/status.json')
  );
  return status[id]
    ? status[id]
    : { id: -01, code: 404, message: 'Invalid status code id', colour: '#fff' };
};

const handle = (err, path) => {
  console.log(`Error: [${path}, ${currentTime()}] > ${err}`);
};

module.exports = {
  currentTime,
  randomString,

  getTopics,

  getStatus,

  handle
};
