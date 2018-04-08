const mongoose = require('mongoose');
const schema = mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId },
  environId: { type: mongoose.Schema.Types.ObjectId },
  deviceId: { type: mongoose.Schema.Types.ObjectId },

  name: { type: String },
  description: { type: String },
  dataUrl: { type: String },
  devices: { type: [ mongoose.Schema.Types.ObjectId ] },
  city: { type: String },
  country: { type: String },
  location: { type: [Number], index: '2d' }
})

const model = mongoose.model('Sensor', schema)
const Sensor = model
const api = { getData, postData, beforeCreate }
module.exports = { model, api }

/*
 * API
 */
async function getData (req, res) {
  try {
    const sensor = await Sensor.findById(req.params.sensorId).exec()
    const result = axios.get(sensor.dataUrl)
    res.send(result.data)
  } catch(e) {
    console.log(e)
    res.status(500).send()
  }
}

async function postData (req, res) { 
  try {
    const sensor = await Sensor.findById(req.params.sensorId).exec()
    const result = await axios.post(sensor.dataUrl, req.body.data)
    res.send(result.data)
  } catch(e) {
    console.log(e)
    res.status(500).send()
  }
}

function beforeCreate(req, res, next) {
  const { environId } = req.params
  req.body.ownerId = req.user._id
  req.body.orgId = req.org._id
  req.body.environId = environId

  console.log(req.body);

  next()
}