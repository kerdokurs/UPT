const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Bookmark = require('./Bookmark');

const userModel = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true
    },
    displayName: { type: String, required: true },
    photoURL: { type: String, required: true },
    email: { type: String, required: true }
  },
  { collection: 'users' }
);

module.exports = mongoose.model('user', userModel);
