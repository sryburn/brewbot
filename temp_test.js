//
// Getting all sensors data...
//
// @chamerling
//

var sensor = require('ds18b20');

sensor.sensors(function(err, ids) {
  if (err) {
    console.log('Can not get sensor IDs', err);
  } else {
    console.log(ids);
    for (var i=0; i<ids.length; i++) {
      var sensorId = ids[i];
      sensor.temperature(ids[i], function(err, result) {
        if (err) {
          console.log('Can not get temperature from sensor', err);
        } else {
          console.log('Sensor ' + sensorId + ' :', result);
        }
      });
    }
  }
});
