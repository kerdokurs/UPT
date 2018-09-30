const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userModel = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true
      /*  validate: {
        validator: (v, cb) => {
          userSchema.find({ uid: v }, (err, docs) => {
            cb(docs.length === 0);
          });
        },
        message: 'User already exists'
      } */
    },
    displayName: { type: String, required: true },
    photoURL: { type: String, required: true },
    email: { type: String, required: true }
  },
  { collection: 'users' }
);
const userSchema = mongoose.model('user', userModel);

module.exports = userSchema;
