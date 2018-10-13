const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookmarkModel = new Schema(
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
    url: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    title: {
      type: String,
      required: true
    }
  },
  {
    collection: 'bookmarks'
  }
);

module.exports = mongoose.model('bookmark', bookmarkModel);
