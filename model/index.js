/* 
 * Setup MongoDB
 */
const mongoose = require('mongoose');
const MONGODB_URL = (process.env.MONGODB_URL || 'mongodb://bitbang:37017/entorno')
console.log("MONGODB_URL " + MONGODB_URL)

const { dbUser, dbPass, dbAuthdb } = require('../config')('dev')

mongoose.connect(MONGODB_URL, { 
  user: dbUser, 
  pass: dbPass,
  auth: { authdb: dbAuthdb }
})

module.exports = {}
const enabled = [ 'User', 'Org', 'Sensor', 'Device', 'Environ', 'Admin' ]
enabled.forEach(m => (module.exports[m] = require(`./${m}`) ))