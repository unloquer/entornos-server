const { User, Org } = require('../model')

module.exports = {
  api: { authenticate }
}

async function authenticate (req, res, next) {
  console.log('here')
  req.user = await User.findOne({ email: 'sgaviria@gmail.com' }).exec()
  req.org = await Org.model.findOne({ email: 'unloquer@gmail.com' }).exec()
  next()
}