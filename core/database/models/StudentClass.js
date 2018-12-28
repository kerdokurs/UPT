const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentClassModel = new Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    teacher: {
      type: String,
      required: true
    },
    students: [],
    created_at: {
      type: Date,
      default: Date.now
    },
    last_changed: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'classes' }
);

module.exports = mongoose.model('studentClass', studentClassModel);
