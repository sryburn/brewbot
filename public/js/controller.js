$(document).ready(function() {
  var socket = io.connect();
  var buttonDiv = document.querySelector('#button');
  var to = null;
  var int = null;

  socket.on('mashTemp', function(t) {
   // console.log(t); 
    $('#mashTemp').html(t);            
  });

  socket.on('hltTemp', function(t) {
   // console.log(t); 
    $('#hltTemp').html(t);            
  });

  socket.on('boilTemp', function(t) {
   // console.log(t); 
    $('#boilTemp').html(t);            
  });

  socket.on('chillerTemp', function(t) {
   // console.log(t); 
    $('#chillerTemp').html(t);            
  });

  socket.on('mashSet', function(mt) {
    console.log("mash set: " + mt); 
    $('#mashSet').html(mt);            
  });

  socket.on('chartUrl', function(url) {
    $('#chart').attr('src', url)           
  });

  socket.on('mashElementState', function(mo) {
      if (mo == 'on') $('#mashLabel').css('border-bottom', '1px solid red');
      else $('#mashLabel').css('border-bottom', '1px solid white');
  });

  socket.on('boilElementState', function(bo) {
      if (bo == 'on') $('#boilLabel').css('border-bottom', '1px solid red');
      else $('#boilLabel').css('border-bottom', '1px solid white');
  });

  socket.on('boilPower', function(bp){
    $('#boilPower').html(bp);
  })

  socket.on('mashPower', function(p) {
   // console.log(t); 
    $('#mashPower').html(p);            
  });

  socket.on('pump1Voltage', function(p1v) {
   // console.log(t); 
    $('#pump1VoltageSet').html(p1v); 
    console.log('received: '+ p1v);           
  });

  socket.on('pump2Voltage', function(p2v) {
   // console.log(t); 
    $('#pump2VoltageSet').html(p2v); 
    console.log('received: '+ p2v);           
  });
  
  $("#boilPlus").on("mousedown touchstart", function (bp) {
    bp.preventDefault();
    boilVal = $('#boilPower').html();
    if (boilVal < 100) boilVal++;
      $("#boilPower").html(boilVal);
      to = setTimeout(function () {
          int = setInterval(function () {
              if (boilVal < 100) boilVal+=5;
              if (boilVal > 100) boilVal=100;
              $("#boilPower").html(boilVal);
          }, 75);
      }, 500);
    }).on("mouseup touchend", function () {
      socket.emit("setBoilPower", boilVal);
      clearTimeout(to);
      clearInterval(int);
  });

  $("#boilMinus").on("mousedown touchstart", function (bm) {
    bm.preventDefault();
    boilVal = $('#boilPower').html();
    if (boilVal > 0) boilVal--;
      $("#boilPower").html(boilVal);
      to = setTimeout(function () {
          int = setInterval(function () {
              if (boilVal > 0) boilVal-=5;
              if (boilVal < 0) boilVal=0;
              $("#boilPower").html(boilVal);
          }, 75);
      }, 500);
    }).on("mouseup touchend", function () {
      socket.emit("setBoilPower", boilVal);
      clearTimeout(to);
      clearInterval(int);
  });

  $("#mashPlus").on("mousedown touchstart", function (mp) {
    mp.preventDefault();
    mashSet = parseFloat($('#mashSet').html());
    if (mashSet < 100) (mashSet+= 0.1);
      mashSet = mashSet.toFixed(2);
      mashSet = parseFloat(mashSet);
      $("#mashSet").html(mashSet);
      console.log(mashSet);
      to = setTimeout(function () {
          int = setInterval(function () {
              if (mashSet < 100) (mashSet+= 0.5);
              if (mashSet > 100) (mashSet=100);
              mashSet = mashSet.toFixed(2);
              mashSet = parseFloat(mashSet);
              $("#mashSet").html(mashSet);
              console.log(mashSet);
          }, 25);
      }, 500);
    }).on("mouseup touchend", function () {
      socket.emit("setMashTemp", mashSet);
      clearTimeout(to);
      clearInterval(int);
  });

  $("#mashMinus").on("mousedown touchstart", function (mm) {
    mm.preventDefault();
    mashSet = parseFloat($('#mashSet').html());
    if (mashSet > 0) (mashSet-= 0.1);
      mashSet = mashSet.toFixed(2);
      mashSet = parseFloat(mashSet);
      $("#mashSet").html(mashSet);
      console.log(mashSet);
      to = setTimeout(function () {
          int = setInterval(function () {
              if (mashSet > 0) (mashSet-= 0.5);
              if (mashSet < 0) (mashSet = 0);
              mashSet = mashSet.toFixed(2);
              mashSet = parseFloat(mashSet);
              $("#mashSet").html(mashSet);
              console.log(mashSet);
          }, 25);
      }, 500);
    }).on("mouseup touchend", function () {
      socket.emit("setMashTemp", mashSet);
      clearTimeout(to);
      clearInterval(int);
  });

  $('#pump1On').on("click", function(p1on){
    p1on.preventDefault();
    pump1VoltageSet = 5;
    $("#pump1VoltageSet").html(pump1VoltageSet);
    socket.emit("setPump1Voltage", pump1VoltageSet);
    console.log('emitting: '+ pump1VoltageSet);
  });

  $('#pump1Off').on("click", function(p1off){
    p1off.preventDefault();
    pump1VoltageSet = 0;
    $("#pump1VoltageSet").html(pump1VoltageSet);
    socket.emit("setPump1Voltage", pump1VoltageSet);
    console.log('emitting: '+ pump1VoltageSet);
  });

  $('#pump2On').on("click", function(p2on){
    p2on.preventDefault();
    pump2VoltageSet = 5;
    $("#pump2VoltageSet").html(pump2VoltageSet);
    socket.emit("setPump2Voltage", pump2VoltageSet);
    console.log('emitting: '+ pump2VoltageSet);
  });

  $('#pump2Off').on("click", function(p2off){
    p2off.preventDefault();
    pump2VoltageSet = 0;
    $("#pump2VoltageSet").html(pump2VoltageSet);
    socket.emit("setPump2Voltage", pump2VoltageSet);
    console.log('emitting: '+ pump2VoltageSet);
  });

  $("#pump1On, #pump1Off, #pump2On, #pump2Off").mouseup(function(){
    $(this).blur();
  })

  $("#pump1VoltagePlus").on("mousedown touchstart", function (p1p) {
    p1p.preventDefault();
    pump1VoltageSet = parseFloat($('#pump1VoltageSet').html());

    if (pump1VoltageSet < 5) (pump1VoltageSet += 0.1);
      pump1VoltageSet = pump1VoltageSet.toFixed(2);
      pump1VoltageSet = parseFloat(pump1VoltageSet);
      $("#pump1VoltageSet").html(pump1VoltageSet);
      to = setTimeout(function () {
          int = setInterval(function () {
              if (pump1VoltageSet < 5) (pump1VoltageSet += 0.1);
              pump1VoltageSet = pump1VoltageSet.toFixed(2);
              pump1VoltageSet = parseFloat(pump1VoltageSet);
              $("#pump1VoltageSet").html(pump1VoltageSet);
          }, 75);
      }, 500);
    }).on("mouseup touchend", function () {
      socket.emit("setPump1Voltage", pump1VoltageSet);
      console.log('emitting: '+ pump1VoltageSet);
      clearTimeout(to);
      clearInterval(int);
  });

  $("#pump1VoltageMinus").on("mousedown touchstart", function (p1m) {
    p1m.preventDefault();
    pump1VoltageSet = parseFloat($('#pump1VoltageSet').html());
    if (pump1VoltageSet > 0) pump1VoltageSet -= 0.1;
      pump1VoltageSet = pump1VoltageSet.toFixed(2);
      pump1VoltageSet = parseFloat(pump1VoltageSet);
      $("#pump1VoltageSet").html(pump1VoltageSet);
      to = setTimeout(function () {
          int = setInterval(function () {
              if (pump1VoltageSet > 0) pump1VoltageSet -= 0.1;
              pump1VoltageSet = pump1VoltageSet.toFixed(2);
              pump1VoltageSet = parseFloat(pump1VoltageSet);
              $("#pump1VoltageSet").html(pump1VoltageSet);
          }, 75);
      }, 500);
    }).on("mouseup touchend", function () {
      socket.emit("setPump1Voltage", pump1VoltageSet);
      console.log('emitting: '+ pump1VoltageSet);
      clearTimeout(to);
      clearInterval(int);
  });

  $("#pump2VoltagePlus").on("mousedown touchstart", function (p2p) {
    p2p.preventDefault();
    pump2VoltageSet = parseFloat($('#pump2VoltageSet').html());

    if (pump2VoltageSet < 5) (pump2VoltageSet += 0.1);
      pump2VoltageSet = pump2VoltageSet.toFixed(2);
      pump2VoltageSet = parseFloat(pump2VoltageSet);
      $("#pump2VoltageSet").html(pump2VoltageSet);
      to = setTimeout(function () {
          int = setInterval(function () {
              if (pump2VoltageSet < 5) (pump2VoltageSet += 0.1);
              pump2VoltageSet = pump2VoltageSet.toFixed(2);
              pump2VoltageSet = parseFloat(pump2VoltageSet);
              $("#pump2VoltageSet").html(pump2VoltageSet);
          }, 75);
      }, 500);
    }).on("mouseup touchend", function () {
      socket.emit("setPump2Voltage", pump2VoltageSet);
      console.log('emitting: '+ pump2VoltageSet);
      clearTimeout(to);
      clearInterval(int);
  });

  $("#pump2VoltageMinus").on("mousedown touchstart", function (p2m) {
    p2m.preventDefault();
    pump2VoltageSet = parseFloat($('#pump2VoltageSet').html());
    if (pump2VoltageSet > 0) pump2VoltageSet -= 0.1;
      pump2VoltageSet = pump2VoltageSet.toFixed(2);
      pump2VoltageSet = parseFloat(pump2VoltageSet);
      $("#pump2VoltageSet").html(pump2VoltageSet);
      to = setTimeout(function () {
          int = setInterval(function () {
              if (pump2VoltageSet > 0) pump2VoltageSet -= 0.1;
              pump2VoltageSet = pump2VoltageSet.toFixed(2);
              pump2VoltageSet = parseFloat(pump2VoltageSet);
              $("#pump2VoltageSet").html(pump2VoltageSet);
          }, 75);
      }, 500);
    }).on("mouseup touchend", function () {
      socket.emit("setPump2Voltage", pump2VoltageSet);
      console.log('emitting: '+ pump2VoltageSet);
      clearTimeout(to);
      clearInterval(int);
  });

});  

