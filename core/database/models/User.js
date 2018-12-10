const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserAchievement = require('./UserAchievement');

const userModel = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true
    },
    displayName: { type: String, required: true },
    photoURL: { type: String, required: true },
    email: { type: String, required: true },
    admin: { type: Boolean, default: false },
    sign_up: { type: Date, default: Date.now },
    last_sign_in: { type: Date, default: Date.now },
    achievements: [UserAchievement.schema],
    metadata: {
      type: Object
    }
  },
  { collection: 'users' }
);

module.exports = mongoose.model('user', userModel);
