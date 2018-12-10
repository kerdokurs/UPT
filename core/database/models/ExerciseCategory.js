const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseCategoryModel = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      unique: true
    },
    created_at: {
      type: Date,
      required: true
    },
    last_changed: {
      type: Date,
      required: true
    }
  },
  {
    collection: 'exercise_categories'
  }
);

module.exports = mongoose.model('exerciseCategory', exerciseCategoryModel);
