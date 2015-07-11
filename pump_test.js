var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var piblaster = require('pi-blaster.js');
var pwmPin = 17;
var voltage = 0;

piblaster.setPwm(pwmPin, voltage);

io.set('log level', 1); // reduce logging

app.use(express.static(__dirname + '/public'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.sockets.on('connection', function (socket) {

  socket.emit('voltage', voltage);

  socket.on('setVoltage', function(data) {
    voltage = (data/5);
    piblaster.setPwm(pwmPin, voltage); 
    console.log('Voltage set to: ' + voltage)
    socket.broadcast.emit('voltage', data);
  });

}); 

