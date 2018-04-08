const { User, Org } = require('../model')

module.exports = {
  api: { authenticate }
}

async function authenticate (req, res, next) {
  req.user = await User.findOne({ email: 'unloquer@gmail.com' }).exec()
  req.org = await Org.model.findOne({ email: 'unloquer@gmail.com' }).exec()
  next()
}