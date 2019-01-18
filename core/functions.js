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
  console.log(`Error: [${path}, ${parseDate(new Date())}] > ${err}`);
};

const hasAchievement = async (user, id) => {
  for (let achievement of user.achievements)
    if (achievement.id === id) return true;

  return false;
};

const grantAchievement = async (uid, id) => {
  let user = await User.find({ uid });
  user = user[0];
  if (await hasAchievement(user, id)) return;
  await user.achievements.push({ id, timestamp: new Date() });
  await user.save().catch(err => handle(err, '/core/functions.js'));
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

  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
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

  getCategories,

  handle,

  grantAchievement,

  shuffleArray,
  randomHexString,

  parseParams
};
