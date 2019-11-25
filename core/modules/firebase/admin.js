const admin = require('firebase-admin');
// const creds = require('../../../data/creds.json');

admin.initializeApp({
  credential: admin.credential.cert({
    service_account: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID
  }),
  databaseURL: 'https://kerdoupt.firebaseio.com'
});

module.exports = admin;
