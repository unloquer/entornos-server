var mongoose = require('mongoose');

var schema = mongoose.Schema({
  orgs: { type: [mongoose.Schema.Types.ObjectId] },

  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  phone: { type: String },
  city: { type: String },
  country: { type: String },
  fb: { type: String }, // facebook
  gg: { type: String }, // google
  gh: { type: String }, // github
  bb: { type: String }, // bitbucket
})

schema.statics.createUser = function createUser (userData) {
  const { firstName, lastName, email, phone, city, country } = userData
  const user = new User(userData)
  return user.save()
}

schema.statics.addOrg = async function addOrg (orgId, userId) {
  const user = await User.findById(userId).exec()
  const idx = user.orgs.indexOf(orgId)
  if(idx > -1) { return }
  user.orgs.push(orgId)
  return user.save()
}

schema.statics.removeOrg = async function removeOrg (orgId, userId) {
  const user = await User.findById(userId).exec()
  const idx = user.orgs.indexOf(orgId)
  if(idx < 0) { return }
  user.orgs = users.orgs.splice(idx, 1)
  user.save()
}

const User = mongoose.model('User', schema)
module.exports = User
