const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionModel = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    uid: {
      type: String,
      required: true,
      unique: true
    },
    created_at: {
      type: Date,
      required: true
    }
  },
  {
    collection: 'sessions'
  }
);

module.exports = mongoose.model('session', sessionModel);
