const database = require('./core/database/database');
const User = require('./core/database/models/User');

const user = {
  uid: 'test',
  authUid: 'test',
  displayName: 'Testing',
  email: '@',
  photoURL: '@'
};

async function run() {
  /* database
    .saveUser(user)
    .then(data => {
      console.log('SET: ' + JSON.stringify(data));
    })
    .catch(err => {
      console.error('SET ERROR: ' + JSON.stringify(err));
    });

  /* database.updateUser(user.uid, { email: '@' }, (x, y) => console.log(x, y)); */

  /* database
    .getUser(user.uid)
    .then(data => {
      console.log('SET: ' + JSON.stringify(data));
    })
    .catch(err => {
      console.error('SET ERROR: ' + JSON.stringify(err));
    }); */

  User.find({}, (err, data) => {
    console.log(err, data);
  });
}

run();
