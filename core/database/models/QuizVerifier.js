const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizVerifierModel = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    e_id: {
      type: String,
      required: true
    },
    created_at: {
      type: Date,
      required: true
    },
    valid_for: {
      type: Number,
      required: true
    },
    data: {
      type: Object,
      required: true
    }
  },
  {
    collection: 'quiz_verifiers'
  }
);

module.exports = mongoose.model('quizVerifier', quizVerifierModel);
