const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackModel = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    uid: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    name: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true,
      unique: true
    }
  },
  { collection: 'feedback' }
);

module.exports = mongoose.model('feedback', feedbackModel);
