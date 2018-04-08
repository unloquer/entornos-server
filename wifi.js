const _log = console.log
const { spawn } = require('child_process')

function $iwlist (done) {
  const child = spawn('iwlist', [ 'wlan0', 'scanning' ])
  child.stdout.on('data', (data) => {
    const results = `${data}`.split('\n')
    var [ match, iface ] = results.shift().match(/([A-Za-z0-9]+)\s+Scan completed/)
    const cells = []
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

    done(cells)
  })  
}

function $connect (essid, done) {
  const $iwconfig_child = spawn('iwconfig', ['wlan0', 'essid', essid])
  
  $iwconfig_child.stdout.on('data', data => {
    console.log('iwconfig wlan0 essid ' + essid)
    console.log(`${data}`.split('\n'))
  })

  $iwconfig_child.on('exit', () => {
    _log('Connecting to ' + essid)
    const $dhclient_child = spawn('dhclient', ['wlan0'])
    $dhclient_child.stdout.on('data', data => {
      console.log('dhclient wlan0')
      console.log(`${data}`.split('\n'))

    });
    const timeout = setTimeout(_ => { $dhclient_child.kill(); done(1, essid) }, 1000 * 60 * 2)
    $dhclient_child.on('exit', done.bind(null, null, essid, timeout))
  })
}

var retries = 5
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
})