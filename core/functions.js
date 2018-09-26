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

const fetchUser = (req, db) => {
  if (isUserLoggedIn(req)) {
    const { uid } = req.cookies;

    db.doc(`users/${uid}`)
      .get()
      .then(doc => {
        if (doc && doc.exists) {
          const data = doc.data();
          return data;
        } else {
          console.log('error');
          return 'Unknown error has occurred.';
        }
      })
      .catch(err => {
        return err;
      });
  } else return null;
};

function getCurrentUser(req, db) {
  return new Promise((res, rej) => {
    if (isUserLoggedIn(req)) {
      const { uid } = req.cookies;

      db.doc(`users/${uid}`)
        .get()
        .then(doc => {
          if (doc && doc.exists) {
            const data = doc.data();
            res(data);
          } else {
            rej('No document');
          }
        })
        .catch(err => {
          rej(err);
        });
    } else {
      res({});
    }
  });
}

const isUserLoggedIn = req => {
  return req.cookies['logged_in'] != null && req.cookies['uid'] != null;
};

const getTopics = () => {
  return JSON.parse(fs.readFileSync(__dirname + '/../data/teemad.json'));
};

module.exports = {
  currentTime,
  kymneastmed,
  getCurrentUser,
  getTopics,
  isUserLoggedIn,
  randomString
};
