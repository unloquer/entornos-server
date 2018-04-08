const mongoose = require('mongoose')

const environSchema = mongoose.Schema({
  ownerId: mongoose.Schema.Types.ObjectId,
  orgId: mongoose.Schema.Types.ObjectId,

  name: { type: String },
  description: { type: String },
  sensors: { type: [mongoose.Schema.Types.ObjectId], },
  location: { type: [Number], index: '2d' }
})

environSchema.statics.addSensor = async function (environId, sensorId) {
  const environ = await Environ.findById(environId).exec()
  const idx = environ.sensors.indexOf(sensorId)
  if(idx > -1) { return }
  environ.sensors.push(id)
  return environ.save()
}

environSchema.statics.removeSensor = async function (environId, sensorId) {
  const environ = await Environ.findById(environId).exec()
  const idx = environ.sensors.indexOf(sensorId)
  if(idx > 0) { return }
  environ.sensors = environ.sensors.splice(idx, 1)
  return environ.save()
}

const model = mongoose.model('Environ', environSchema)
const Environ = model
const api = { addSensor, removeSensor, beforeCreate }
module.exports = { model, api }

/*
 * API functions
 */
function beforeCreate (req, res, next) {
  const ownerId = req.user._id
  const orgId = req.org._id
  req.body.ownerId = ownerId
  req.body.orgId = orgId
  next()
}

async function addSensor (req, res) {
  try {
    const environ = await model.addSensor(environId, req.body)
    res.send(environ)
  } catch(e) {
    res.status(500).send() 
    console.log({ err })
  }
}

async function removeSensor (req, res) {
  try {
    const environ = await model.removeSensor(environId, req.body)
    res.send(environ)
  } catch(e) {
    res.status(500).send()
    console.log({ err })
  }
}
