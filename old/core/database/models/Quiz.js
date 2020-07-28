const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizModel = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    category_id: {
      type: String,
      required: true
    },
    title: { type: String, required: true },
    data: {
      type: Object,
      required: true
    },
    metadata: {
      type: Object,
      required: false
    },
    created_at: {
      type: Date,
      required: true
    },
    last_changed: {
      type: Date,
      required: true
    },
    published: {
      type: Boolean,
      required: true
    }
  },
  {
    collection: 'quizzes'
  }
);

module.exports = mongoose.model('quiz', quizModel);
