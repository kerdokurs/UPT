const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const achievementModel = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    last_changed: {
      type: Date,
      required: true
    }
  },
  {
    collection: 'achievements'
  }
);

module.exports = mongoose.model('achievement', achievementModel);
