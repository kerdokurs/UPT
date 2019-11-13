const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    role: { type: Number, default: 0 },
    sign_up: { type: Date, default: Date.now },
    last_sign_in: { type: Date, default: Date.now },
    achievements: [],
    metadata: {
      type: Object
    },
    allow_leaderboard: {
      type: Boolean,
      default: false
    }
  },
  { collection: 'users' }
);

module.exports = mongoose.model('user', userModel);
