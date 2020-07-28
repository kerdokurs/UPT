const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoryModel = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true,
      unique: true
    }
  },
  { collection: 'categories' }
);

module.exports = mongoose.model('category', categoryModel);
