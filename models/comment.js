const mongoose = require('mongoose');

const { DateTime } = require('luxon');

const CommentSchema = mongoose.Schema({
  body: { type: String, required: true, minLength: 1, maxLength: 280 },
  author: { type: String, required: true, minLength: 1, maxLength: 32 },
  parent: { type: mongoose.Schema.ObjectId, ref: 'Post', required: true },
  date: { type: Date, default: Date.now, required: true },
});

CommentSchema.virtual('url').get(function() {
  return `/api/posts/${this.parent}/comments/${this._id}`;
});

CommentSchema.virtual('time_iso').get(function () {
  const timeISO = DateTime.fromJSDate(this.date).toISO({
    suppressSeconds: true,
    suppressMilliseconds: true,
    includeOffset: false,
  });
  const timeArray = timeISO.split('T');
  return `${timeArray[0]} ${timeArray[1]}`;
});

module.exports = mongoose.model('Comment', CommentSchema);
