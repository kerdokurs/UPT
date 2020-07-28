const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseReivisonModel = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    type: { type: String },
    uid: {
      type: String,
      required: true
    },
    title: { type: String, required: true },
    created_at: {
      type: Date,
      required: true
    },
    data: {
      type: Object,
      required: true
    }
  },
  {
    collection: 'exercise_revisions'
  }
);

module.exports = mongoose.model('exerciseRevision', exerciseReivisonModel);
