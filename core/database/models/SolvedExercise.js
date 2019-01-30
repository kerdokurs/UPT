const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const solvedExerciseModel = new Schema(
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
    eid: {
      type: String
    },
    rid: {
      type: String
    },
    type: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    solved: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    data: {
      type: Object
    },
    points: {
      type: Number,
      default: 0
    }
  },
  {
    collection: 'solved_exercises'
  }
);

module.exports = mongoose.model('solvedExercise', solvedExerciseModel);
