const admin = require('firebase-admin');
const creds = require('../environment/creds.json');

admin.initializeApp({
  credential: admin.credential.cert(creds),
  databaseURL: 'https://kerdoupt.firebaseio.com'
});

const db = admin.firestore();
db.settings({
  timestampsInSnapshots: true
});

module.exports = db;
