const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userAchievementModel = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('userAchievement', userAchievementModel);
