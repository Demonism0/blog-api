const mongoose = require('mongoose');

const { DateTime } = require('luxon');

const PostSchema = mongoose.Schema({
  title: { type: String, required: true, minLength: 1, maxLength: 70 },
  body: { type: String, required: true, minLength: 1, maxLength: 280 },
  date: { type: Date, default: Date.now, required: true },
  public: { type: Boolean, default: true, required: true },
});

PostSchema.virtual('url').get(function () {
  return `/api/posts/${this._id}`;
});

PostSchema.virtual('time_iso').get(function () {
  const timeISO = DateTime.fromJSDate(this.date).toISO({
    suppressSeconds: true,
    suppressMilliseconds: true,
    includeOffset: false,
  });
  const timeArray = timeISO.split('T');
  return `${timeArray[0]} ${timeArray[1]}`;
});

module.exports = mongoose.model('Post', PostSchema);
