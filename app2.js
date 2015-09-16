'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var tempProbes = require('ds18x20');
var PID = require('pid-controller');
var wpi = require('wiring-pi');
var emitter = new (require('events').EventEmitter);

var Timer = require('./timer.js').Timer;
var timer = new Timer();

var pidfrequency = 100; //TODO make set function
var cycletime = 2000; //TODO make set function
var boilPower = 0; //for pid
var mashSet = 0; //for pid
var hltTemp = 999;  //for pid can remove if triggering pid from event

var boilElement = 26;
var mashElement = 23;
var pump1 = 1;
var pump2 = 24;
wpi.setup('wpi');
wpi.pinMode(boilElement, wpi.OUTPUT);
wpi.pinMode(mashElement, wpi.OUTPUT);
wpi.pinMode(pump1, wpi.PWM_OUTPUT);
wpi.pinMode(pump2, wpi.PWM_OUTPUT);

var mashPid = new PID(hltTemp, mashSet, 10,2,1, PID.DIRECT, cycletime);
mashPid.setMode(PID.AUTOMATIC);
mashPid.setSampleTime(pidfrequency);

var boilPid = new PID(50, 32, 10,2,1, PID.DIRECT, cycletime);

var tempSensors = [['28-000006744eb8','mashTemp'], ['28-000006740ce7','hltTemp'], ['28-00000673b5b3','boilTemp'], ['28-000006743ab7', 'chillerTemp']];
var pump1Voltage = 0;
var pump2Voltage = 0;


// Plot.ly stuff
var plotly = require('plotly')('sryburn','ivcg1l3okz');
var moment = require('moment');
var initdata = [{x:[], y:[], stream:{token:'sampoxq6xt', maxpoints:200}, name:'Mash Temp'}, {x:[], y:[], stream:{token:'120n8aiha1', maxpoints:200}, name:'Set Point'}];
var layout = {xaxis: {title:'Time'}, yaxis: {title: 'Temperature'}, showlegend: true, title: 'Mash Control'};
var initlayout = {layout : layout, fileopt : 'overwrite', filename : moment().format("YYYY-MM-DD h:mm:ss") + ' Mash'};
var chartUrl;

wpi.pwmSetMode(0);
wpi.pwmSetClock(2);
wpi.pwmSetRange(128);


io.set('log level', 1); // reduce logging

app.use(express.static(__dirname + '/public'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.sockets.on('connection', function (socket) {

  var emitInitialValues = function(){  
    socket.emit('currentEndTime', {time: timer.getEndTime() });
    socket.emit('boilPower', boilPower);
    socket.emit('mashSet', mashSet);
    socket.emit('pump1Voltage', pump1Voltage);
    socket.emit('pump2Voltage', pump2Voltage);
    socket.emit('chartUrl', chartUrl);
  }
  setTimeout(emitInitialValues,1000);  //horrible hack to ensure client receives initial values
  
  emitter.on("newTemps", function (temps) { 
    socket.emit('temps', temps);
  });
  
  emitter.on("pidOutput", function (pidOutput) { 
    socket.emit('pidOutput', pidOutput);
  });
  
  socket.on('setTimer', function(data) {
    timer.setEndTime(data.time);
    socket.broadcast.emit('currentEndTime', {time: timer.getEndTime() });
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

  socket.on('setPump1Voltage', function(data) {
    pump1Voltage = data;
    var pwmValue = (data*25.6);
    pwmValue = Math.round(pwmValue);
    wpi.pwmWrite(pump1, pwmValue);
    console.log('Pump1 voltage set to: ' + pump1Voltage)
    socket.broadcast.emit('pump1Voltage', pump1Voltage);
  });

  socket.on('setPump2Voltage', function(data) {
    pump2Voltage = data;
    var pwmValue = (data*25.6);
    pwmValue = Math.round(pwmValue);
    wpi.pwmWrite(pump2, pwmValue);
    console.log('Pump2 voltage set to: ' + pump2Voltage)
    socket.broadcast.emit('pump2Voltage', data);
  });

});

function compute (){
  mashPid.setInput(hltTemp);
  mashPid.compute(); 
  var pidOutput = {mashElementState:'off', boilElementState:'off', mashPower:'0'};

  boilPid.setOutput(boilPower * cycletime /100);
  if (mashPid.timeProportionalOutput == true){
    pidOutput.mashElementState = 'on';
    wpi.digitalWrite(mashElement, 1);
  }
  else{
    pidOutput.mashElementState = 'off';
    wpi.digitalWrite(mashElement, 0);
  }

  if ((boilPid.timeProportionalOutput == true)&&(pidOutput.mashElementState == 'off')){
    pidOutput.boilElementState = 'on'
    wpi.digitalWrite(boilElement, 1);
  } 
  else{
    pidOutput.boilElementState = 'off'
    wpi.digitalWrite(boilElement, 0);
  }    
  pidOutput.mashPower = (mashPid.myOutput/cycletime*100).toFixed(2);

  emitter.emit('pidOutput', pidOutput);
}

setInterval(compute, pidfrequency);

function readTemps(callback){
  tempProbes.getAll(function (err, results) {
    results = JSON.stringify(results); 
    for (var i = 0; i < tempSensors.length; i++){
      results = results.replace(tempSensors[i][0],tempSensors[i][1]);
    }
    results = JSON.parse(results);
    emitter.emit("newTemps", results);
    hltTemp = results.hltTemp;
    callback();
  }); 
}

function monitorTemps() {
    readTemps(monitorTemps);
}

monitorTemps();

plotly.plot(initdata, initlayout, function (err, msg) {
    if (err) return console.log(err);
    chartUrl = msg.url + ".embed"

    var stream1 = plotly.stream('sampoxq6xt');
    var stream2 = plotly.stream('120n8aiha1');

    emitter.on("newTemps", function (temps) { 
      var a = moment().format("YYYY-MM-DD h:mm:ss");
      var data = { x : a, y : temps.mashTemp};
      var streamObject = JSON.stringify(data);
      stream1.write(streamObject+'\n');
      var data2 = { x : a, y : mashSet};
      var streamObject2 = JSON.stringify(data2);
      stream2.write(streamObject2+'\n');
    });
});
