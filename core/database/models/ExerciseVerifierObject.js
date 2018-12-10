const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseVerifierObjectModel = new Schema(
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
    collection: 'exercise_verifier_objects'
  }
);

module.exports = mongoose.model(
  'exerciseVerifierObject',
  exerciseVerifierObjectModel
);
