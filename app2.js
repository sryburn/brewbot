'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var tempProbes = require('ds18x20');
var PID = require('pid-controller');
var raspi = require('raspi-llio');

var Timer = require('./timer.js').Timer;
var timer = new Timer();

var hltTemp = 999;
var mashTemp = 999;
var boilTemp = 999;
var chillerTemp = 999;

var pidfrequency = 100; //TODO make set function
var cycletime = 2000; //TODO make set function
var boilPower = 0;
var mashSet = 0;

var boilElement = new raspi.GPIO(26, raspi.GPIO.OUTPUT);
var mashElement = new raspi.GPIO(23, raspi.GPIO.OUTPUT);

var mashPid = new PID(mashTemp, mashSet, 10,2,1, PID.DIRECT, cycletime);
mashPid.setMode(PID.AUTOMATIC);
mashPid.setSampleTime(pidfrequency);

var boilPid = new PID(50, 32, 10,2,1, PID.DIRECT, cycletime);


io.set('log level', 1); // reduce logging

app.use(express.static(__dirname + '/public'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.sockets.on('connection', function (socket) {
  
  socket.emit('currentEndTime', {time: timer.getEndTime() });
  socket.emit('boilPower', boilPower);
  socket.emit('mashSet', mashSet)

  var emitTemps = function(){
    socket.emit('mashTemp', Number(mashTemp).toFixed(1));
    socket.emit('hltTemp', Number(hltTemp).toFixed(1));
    socket.emit('boilTemp', Number(boilTemp).toFixed(1));
    socket.emit('chillerTemp', Number(chillerTemp).toFixed(1));
  }
  setInterval(emitTemps, 1000);

  function compute (){
    mashPid.setInput(mashTemp);
    mashPid.compute(); 

    boilPid.setOutput(boilPower * cycletime /100);
    if (boilPid.timeProportionalOutput == true){
      socket.emit('boilElementState', 'On');
      boilElement.digitalWrite(raspi.GPIO.HIGH);
    } 
    else{
      socket.emit('boilElementState', 'Off');
      boilElement.digitalWrite(raspi.GPIO.LOW);
    } 
    
    if (mashPid.timeProportionalOutput == true){
     socket.emit('mashElementState', 'On');
     mashElement.digitalWrite(raspi.GPIO.HIGH);
    }
    else{
     socket.emit('mashElementState', 'Off');
     mashElement.digitalWrite(raspi.GPIO.LOW);
    }

    socket.emit('mashPower', (mashPid.myOutput/cycletime*100).toFixed(2))
  }

  setInterval(compute, pidfrequency);

    socket.on('setTimer', function(data) {
      timer.setEndTime(data.time);
      socket.broadcast.emit('currentEndTime', {time: timer.getEndTime() });
      //console.log({time: timer.getEndTime() });
    });

    socket.on('setBoilPower', function(data) {
      boilPower = data;
      socket.broadcast.emit('boilPower', boilPower);
    });

    socket.on('setMashTemp', function(data) {
      mashSet = data;
      mashPid.setPoint(mashSet);
      socket.broadcast.emit('mashSet', mashSet);
    });

});


function readTemps(callback){
  tempProbes.getAll(function (err, results) { 
    hltTemp = results['28-000006740ce7'];
    mashTemp = results['28-000006744eb8'];
    boilTemp = results['28-00000673b5b3'];
    chillerTemp = results['28-000006743ab7'];
    callback();
  }); 
}

function monitorTemps() {
    readTemps(monitorTemps);
}

monitorTemps();
