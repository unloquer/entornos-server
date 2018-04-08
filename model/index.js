/* 
 * Setup MongoDB
 */
const mongoose = require('mongoose');
const MONGODB_URL = (process.env.MONGODB_URL || 'mongodb://localhost/entorno')
console.log("MONGODB_URL " + MONGODB_URL)

mongoose.connect(MONGODB_URL)

module.exports = {}
const enabled = [ 'User', 'Org', 'Sensor', 'Device', 'Environ', 'Admin' ]
enabled.forEach(m => (module.exports[m] = require(`./${m}`) ))