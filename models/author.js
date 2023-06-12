const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual('name').get(function () {
  let fullname = '';
  if (this.first_name && this.family_name) {
    fullname = `${this.first_name}, ${this.family_name}`;
  }

  return fullname
});

// Virtual for author's URL
AuthorSchema.virtual('url').get(function () {
  return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual('formatted_dob').get(function () {
  if (this.date_of_birth) {
    return DateTime.fromJSDate(this.date_of_birth).toUTC().toLocaleString(DateTime.DATE_MED);
  } else {
    return ' ';
  }
});

AuthorSchema.virtual('formatted_dod').get(function () {
  if (this.date_of_death) {
    return DateTime.fromJSDate(this.date_of_death).toUTC().toLocaleString(DateTime.DATE_MED);
  } else {
    return ' ';
  }
});

AuthorSchema.virtual('iso_date_of_birth').get(function () {
  if (this.date_of_birth) {
    return DateTime.fromJSDate(this.date_of_birth).toUTC().toISODate();
  } else {
    return ' ';
  }
});

AuthorSchema.virtual('iso_date_of_death').get(function () {
  if (this.date_of_death) {
    return DateTime.fromJSDate(this.date_of_death).toUTC().toISODate();
  } else {
    return ' ';
  }
});

module.exports = mongoose.model('Author', AuthorSchema);