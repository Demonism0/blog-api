const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String, required: true, maxLength: 38, minLength: 2,
  },
  password: {
    type: String, required: true, maxLength: 100,
  }
})

module.exports = mongoose.model('User', UserSchema);
