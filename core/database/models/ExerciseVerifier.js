const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseVerifierModel = new Schema(
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
    variables: {
      type: Object,
      required: true
    },
    variant: {
      type: Number,
      required: true
    },
    formula: {
      type: String,
      required: true
    },
    answer: {
      type: Number,
      required: true
    }
  },
  {
    collection: 'exercise_verifiers'
  }
);

module.exports = mongoose.model('exerciseVerifier', exerciseVerifierModel);
