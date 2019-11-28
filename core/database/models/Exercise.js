const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseModel = new Schema(
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
    title: {
      type: String,
      required: true
    },
    variables: {
      type: Array,
      required: false
    },
    variants: {
      type: Array,
      required: true
    },
    points: {
      type: Number,
      required: false,
      default: 0
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
    collection: 'exercises'
  }
);

module.exports = mongoose.model('exercise', exerciseModel);
