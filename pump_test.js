var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var raspi = require('raspi-llio');
var voltage = 0;
var pwm = new raspi.PWM(24);
raspi.PWM.setMode(0);
raspi.PWM.setClockDivisor(2);
raspi.PWM.setRange(128);

io.set('log level', 1); // reduce logging

app.use(express.static(__dirname + '/public'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.sockets.on('connection', function (socket) {
  socket.emit('voltage', voltage);
  socket.on('setVoltage', function(data) {
  	voltage = (data*25.6);
  	voltage = Math.round(voltage);
  	pwm.write(24, voltage);
  	console.log('Voltage set to: ' + voltage)
  	socket.broadcast.emit('voltage', data);
  });
}); 
