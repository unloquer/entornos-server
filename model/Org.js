const mongoose = require('mongoose');

const schema = mongoose.Schema({
  ownerId: mongoose.Schema.Types.ObjectId,

  name: { type: String },
  email:  { type: String },
  description: { type: String },
  city: { type: String },
  country: { type: String },
  location: { type: [Number], index: '2d' }
});

schema.statics.createOrg = function createOrg (orgData, ownerId) {
  const { name, email, description, city, country, location } = orgData;
  const org = new Org({ ownerId, name, email, description, city, country, location })
  return org.save()
}

const Org = mongoose.model('Org', schema);
module.exports = { model: Org }
