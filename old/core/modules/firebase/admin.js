const admin = require('firebase-admin');
const creds = require('../../../data/creds.json');

admin.initializeApp({
  credential: admin.credential.cert(creds),
  databaseURL: 'https://kerdoupt.firebaseio.com'
});

module.exports = admin;
