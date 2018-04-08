const express = require('express');
const bodyParser = require('body-parser');
const restful = require('node-restful');

const cors = require('cors')

const { User, Device, Environ, Sensor, Admin } = require('./model')
const Auth = require('./auth/Auth')

const APP_PORT = (process.env.PORT || 8080)
const APP_URL_PREFIX = (process.env.URL_PREFIX || '/api')

const app = express()
const apiRouter = express.Router()

app.use(cors())
app.use(bodyParser.text())
app.use(bodyParser.json())
app.use(bodyParser.json({type:'application/vnd.api+json'}))
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(APP_URL_PREFIX, apiRouter)
app.set('port', APP_PORT)

apiRouter.use(Auth.api.authenticate)

/*
 * Domain API
 */
restful.model('Device', Device.model.schema)
  .methods([ 'get', 'post', 'put', 'delete' ])
  // Routings
  .route('.post', Device.api.registerDevice)
  .route('.delete', Device.api.removeDevice)
  // Before hooks
  .before('post', Device.api.beforeCreate)
  // After hooks
  // .after('put', Device.api.afterUpdate)
  // Register /devices resource
  .register(apiRouter, '/devices')

restful.model('Environ', Environ.model.schema)
  .methods(['get', 'post', 'put', 'delete'])
  // Before create, add ownership from User and Org
  .before('post', Environ.api.beforeCreate)
  // Register /environs resource
  .register(apiRouter, '/environs')

restful.model('Sensor', Sensor.model.schema)
  .methods(['get', 'post', 'put', 'delete'])
  .before('post', Sensor.api.beforeCreate)
  .register(apiRouter, '/environs/:environId/sensors')


/* 
 * WiFi API
 */
// Wifi.api.setup(router)

/*
 * Devices Admin API
 */
app.post('/devices/status', Device.api.updateStatus)
app.get('/devices/scan', Device.api.scanDevices)
app.post('/devices/connect', Device.api.connectDevice)


/* 
 * Sensor Data API
 */
apiRouter.get('/sensors/:sensorId/data', Sensor.api.getData)
apiRouter.post('/sensors/:sensorId/data', Sensor.api.postData)

/*
 * Admin API
 */
app.get('/networks/scan', Device.api.scanNetworks)
app.get('/admin/wifi/scan', Admin.api.scan)
app.post('/admin/wifi/devices', Admin.api.setupDevice)

const server = app.listen(app.get('port'), function() {
  console.log("port is: " + app.get('port'));
  console.log("Server started listening...");
});
