const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const topicModel = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    parent: {
      type: String,
      required: true
    },
    data: {
      type: String,
      required: true
    },
    last_changed: {
      type: Date,
      required: false
    }
  },
  { collection: 'topics' }
);

module.exports = mongoose.model('topic', topicModel);
