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
      required: true
    },
    created_at: {
      type: Date,
      required: true
    },
    role: {
      type: Number,
      default: 0
    }
  },
  {
    collection: 'sessions'
  }
);

module.exports = mongoose.model('session', sessionModel);
