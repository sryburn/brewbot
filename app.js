var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var PID = require('pid-controller');
var raspi = require('raspi-io');
var five = require('johnny-five');
var pump1State = false;
var pidfrequency = 100; //TODO make set function
var cycletime = 2000; //TODO make set function
var Timer = require('./timer.js').Timer;
var timer = new Timer();
var boilPower = 0;
var mashSet = 30;
var ds18b20 = require('ds18b20');
var temperature = '...';
// Plot.ly stuff
var plotly = require('plotly')('sryburn','ivcg1l3okz');
var moment = require('moment');
var initdata = [{x:[], y:[], stream:{token:'sampoxq6xt', maxpoints:200}, name:'Mash Temp'}, {x:[], y:[], stream:{token:'120n8aiha1', maxpoints:200}, name:'Set Point'}];
var layout = {xaxis: {title:'Time'}, yaxis: {title: 'Temperature'}, showlegend: true, title: 'Mash Control'};
var initlayout = {layout : layout, fileopt : 'overwrite', filename : moment().format("YYYY-MM-DD h:mm:ss") + ' Mash'};


var mashPid = new PID(50, 32, 10,2,1, PID.DIRECT, cycletime);
//mashPid.setTunings(10,2,1);
mashPid.setMode(PID.AUTOMATIC);
mashPid.setSampleTime(pidfrequency);

var boilPid = new PID(50, 32, 10,2,1, PID.DIRECT, cycletime);
/*boilPid.setTunings(10,2,1);
boilPid.setMode(PID.MANUAL);
boilPid.setSampleTime(pidfrequency);
boilPid.setOutput(1000);*/


io.set('log level', 1); // reduce logging

app.use(express.static(__dirname + '/public'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});

board = new five.Board({io: new raspi()});

board.on("ready", function() {
  pump1 = new five.Pin('GPIO18');
  boilElement = new five.Pin('GPIO12');
  mashElement = new five.Pin('GPIO13');
  readTemp(); 
  /*var temperature = new five.Temperature({
      controller: "DS18B20",
      pin: 2,
      freq: pidfrequency //frequency that temperature is returned
      });  */

  io.sockets.on('connection', function (socket) {

    socket.emit('currentEndTime', {time: timer.getEndTime() });
    socket.emit('boilPower', boilPower);
    socket.emit('mashSet', mashSet)

 // Pump 1 emit functions
    //Query and emit pump state when socket connects
    pump1.query(function(state) {
      if (state.value == 1) socket.emit("pump1", "high");
      else socket.emit("pump1", "low");
    });
    //Emit pump state when pump is switched
    ["high", "low"].forEach(function(type) {
      pump1.on(type, function() {
        socket.emit("pump1", type);
      });
    });

    function compute (){
      socket.emit('temperature', (temperature || 20).toFixed(2)); //set temp to 20 if can't read temp
      mashPid.setInput(temperature || 20); //set tempt to 20 if can't read temp
      mashPid.compute(); 

      boilPid.setOutput(boilPower * cycletime /100);
      if (boilPid.timeProportionalOutput == true){
        socket.emit('boilElementState', 'On');
        boilElement.high();
      } 
      else{
        socket.emit('boilElementState', 'Off');
        boilElement.low();

      } 

      
      if (mashPid.timeProportionalOutput == true) socket.emit('mashElementState', 'On');
      else socket.emit('mashElementState', 'Off');

      socket.emit('mashPower' , (mashPid.myOutput/cycletime*100).toFixed(2))
    }

    setInterval(compute, pidfrequency);

    socket.on('togglePump1', function () {
      pump1State = !pump1State;
      if (pump1State) pump1.high();
      else pump1.low();
      //console.log("toggle bitch")
    }); 

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
});

function readTemp () {
  ds18b20.temperature('28-0000067455af', function(err, value) {
    temperature = value;
    readTemp();
  });
}

plotly.plot(initdata, initlayout, function (err, msg) {
    if (err) return console.log(err);
    console.log(msg);

    var stream1 = plotly.stream('sampoxq6xt');
    var stream2 = plotly.stream('120n8aiha1');
  
    setInterval(function () {
        var a = moment().format("YYYY-MM-DD h:mm:ss");
        var data = { x : a, y : temperature};
        var streamObject = JSON.stringify(data);
        stream1.write(streamObject+'\n');

        var data2 = { x : a, y : mashSet};
        var streamObject2 = JSON.stringify(data2);
        stream2.write(streamObject2+'\n');
    }, 1000);
});
