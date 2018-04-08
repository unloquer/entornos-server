const _ = require('lodash')
const mongoose = require('mongoose')
const { spawn } = require('child_process')
const axios = require('axios')

const deviceSchema = mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId },
  orgId: { type: mongoose.Schema.Types.ObjectId },

  name: { type: String },
  description: { type: String },
  status: { type: String },
  chipId: { type: String },
  wifi: { 
    enabled: { type: Boolean, default: false },
    ip: { type: String },
    mac: { type: String },
    ssid: { type: String },
    passwd: { type: String }
  },
  linked: { type: Boolean, default: false },
  location: { type: [Number], index: '2d' }
})

deviceSchema.statics.registerDevice = async function (deviceData) {
  const { name, description } = deviceData
  const device = new Device({ name, description })
  return await device.save()
}

deviceSchema.statics.removeDevice = function (deviceId) {
}

const model = mongoose.model('Device', deviceSchema)
const Device = model
const api = { 
  registerDevice, putDevice, removeDevice, 
  beforeCreate, afterUpdate, updateStatus, scanDevices,
  connectDevice, scanNetworks
}
module.exports = { model, api }

/*
 * API functions
 */
async function registerDevice (req, res) {
  try {
    const device = await Device.registerDevice(req.body)
    res.status(201).send(device)
  } catch(err) {
    console.log({ err })
    res.status(500).send()
  }
}

function putDevice () {}

function removeDevice() {}

function beforeCreate(req, res, next) {
  req.body.ownerId = req.user._id
  req.body.orgId = req.org._id
  next()
}

function afterUpdate() {}

async function updateStatus(req, res) {
  const status = req.body.status
  const chipId = req.body.chipId
  const ip = req.body.ip
  const mac = req.body.mac

  try {
    const device = await Device.findOne({ chipId }).exec()

    if(device) {
      device.status = status
      device.wifi = Object.assign({}, device.wifi, { ip });
      device.save()
      res.send(device)
    } else {
      const name = chipId
      const newDevice = new Device({ chipId, status, name })
      newDevice.linked = true;
      newDevice.wifi = Object.assign({}, newDevice.wifi, { ip, mac });
      newDevice.save()
      res.send(newDevice)
    }
  } catch(e) {
    res.send(500)
  }
}

function scanDevices(req, res) {
  console.log('Start scanning ...')
  const to = setTimeout(() => { req.send(408) }, 1 * 60 * 1000)
  $iwlist(cells => {
    console.log('Done scanning ...')
    clearTimeout(to);
    res.send(Object.keys(cells).filter(k => cells[k].essid.match(/^ESP/)))
  })    
}

async function connectDevice(req, res) {
  const { name, ssid, psk } = req.body
  const deviceSSID = `${name}`

  $connect(deviceSSID, (err, essid, timeout) => {

    clearTimeout(timeout);
    
    if (err) { 
      console.log("Could not connect to device "+deviceId);
      return res.send(500) 
    }

    console.log("Connected to device "+deviceSSID)

    var request = require('request');
    request(`http://192.168.40.1/c?ssid=${ssid}&psk=${psk}`, (error, response, body) => {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
    });

    // axios.get(`http://192.168.40.1/c?ssid=${ssid}&psk=${psk}&api='192.168.0.100:8080'`)
    //   .then(() => {
    //     console.log('device connected to '+ssid)
    //   })
    //   .catch(console.log)

    setTimeout(() => {
      res.send()
    }, 5000)
    
  })
}

async function scanNetworks(req, res) {
  const to = setTimeout(_ => res.send(408), 1 * 60 * 1000)
  $iwlist(cells => { res.send(cells); clearTimeout(to) })
}

async function $iwlist (done) {
  var cells = {}

  // Make sure the wireless iface is up
  try { await $ifconfigUp() } catch(e) { return console.log(e) }

  const child = spawn('iwlist', [ 'wlan0', 'scan' ])
  child.stdout.on('data', (data) => {

    const results = `${data}`.split('\n')
    var [ match, iface ] = results.shift().match(/([A-Za-z0-9]+)\s+Scan completed/)
    var currentCell = []
    results.forEach(r => {
      if (m = r.match(/\s+Cell\s(\d{2})\s-\sAddress:\s([A-F0-9:]+)/)) {
        var [ match, cell, bssid ] = m
        currentCell = cell
        cells[cell] = { bssid }
        return
      }

      if (m = r.match(/\s+ESSID:"(.+)"/)) {
        var [ match, essid ] = m
        cells[currentCell].essid = essid
        return
      }
    })
  })  

  child.on('exit', function() {
    done(cells)
  })
}

async function $connect (essid, done) {
  // Make sure the wireless iface is up
  try { await $ifconfigUp() } catch(e) { return console.log(e) }

  const $iwconfig_child = spawn('iwconfig', ['wlan0', 'essid', essid])
  
  $iwconfig_child.stdout.on('data', data => {
    console.log('iwconfig wlan0 essid ' + essid)
    console.log(`${data}`.split('\n'))
  })

  $iwconfig_child.on('exit', () => {
    console.log('Connecting to ' + essid)
    const $dhclient_child = spawn('dhcpcd', ['wlan0'])
    $dhclient_child.stdout.on('data', data => {
      console.log('dhclient wlan0')
      console.log(`${data}`.split('\n'))

    });
    const timeout = setTimeout(_ => { $dhclient_child.kill(); done(1, essid) }, 1000 * 60 * 2)
    $dhclient_child.on('exit', done.bind(null, null, essid, timeout))
  })
}

function $ifconfigUp() {
  return new Promise((resolve, reject) => {
    const $ifconfig_child = spawn('ifconfig', ['wlan0', 'up'])
    const to = setTimeout(() => { reject("TIMEOUT") }, 1 * 60 * 1000)
    $ifconfig_child.on('exit', _ => {
      clearTimeout(to)
      resolve()
    })    
  }
}

/*  var retries = 5
  $iwlist(cells => {
    for (i in cells) {
      const { essid } = cells[i]
      if (essid.match(/^ESP/)) {
        $connect(essid, done)
        break
      }
    }

    function done(err, essid, timeout) {
      if (err) {
        console.log('Could not connect to ' + essid) 
        if (retries--) {
          $connect(essid, done)
        }
        return
      }

      clearTimeout(timeout);
      console.log('Connected to ' + essid)
    }
  })*/
