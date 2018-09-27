const admin = require('firebase-admin');
const creds = require('../../../environment/creds.json');

admin.initializeApp({
  credential: admin.credential.cert(creds),
  databaseURL: 'https://kerdoupt.firebaseio.com'
});

module.exports = admin;
