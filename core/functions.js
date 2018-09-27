const fs = require('fs');

function randomString(length) {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

const currentTime = () => {
  const now = new Date();

  let hours = now.getHours();
  if (parseInt(hours) < 10) hours = '0' + hours;

  let minutes = now.getMinutes();
  if (parseInt(minutes) < 10) minutes = '0' + minutes;

  let seconds = now.getSeconds();
  if (parseInt(seconds) < 10) seconds = '0' + seconds;

  let day = now.getDate();
  if (parseInt(day) < 10) day = '0' + secodaynds;

  let month = now.getMonth();
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

const kymneastmed = {
  all: () => {
    return JSON.parse(
      fs.readFileSync(__dirname + '/../data/kymne-astmed.json')
    );
  },
  random: () => {
    const json = kymneastmed.all();
    const keys = Object.keys(json);
    const random = keys[Math.floor(Math.random() * keys.length)];
    return json[random];
  }
};

const getTopics = () => {
  return JSON.parse(fs.readFileSync(__dirname + '/../data/teemad.json'));
};

const getTopic = topicId => {
  const topics = getTopics();
  for (i in topics) if (topics[i].id === topicId) return topics[i];
};

const getField = (topic, fieldId) => {
  if (topic)
    for (i in topic.fields)
      if (topic.fields[i].id === fieldId) return topic.fields[i];
};

module.exports = {
  currentTime,
  kymneastmed,
  randomString,
  getTopics,
  getTopic,
  getField
};
