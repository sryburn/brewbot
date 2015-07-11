$(document).ready(function() {
  var socket = io.connect();
  var buttonDiv = document.querySelector('#button');
  var to = null;
  var int = null;

  $("#voltagePlus").on("mousedown touchstart", function (mp) {
    mp.preventDefault();
    voltageSet = parseFloat($('#voltageSet').html());

    if (voltageSet < 5) (voltageSet += 0.1);
      voltageSet = voltageSet.toFixed(2);
      voltageSet = parseFloat(voltageSet);
      $("#voltageSet").html(voltageSet);
      to = setTimeout(function () {
          int = setInterval(function () {
              if (voltageSet < 5) (voltageSet += 0.1);
              voltageSet = voltageSet.toFixed(2);
              voltageSet = parseFloat(voltageSet);
              $("#voltageSet").html(voltageSet);
          }, 75);
      }, 500);
    }).on("mouseup touchend", function () {
      socket.emit("setVoltage", voltageSet);
      console.log('emitting: '+ voltageSet);
      clearTimeout(to);
      clearInterval(int);
  });

  $("#voltageMinus").on("mousedown touchstart", function (mm) {
    mm.preventDefault();
    voltageSet = parseFloat($('#voltageSet').html());
    if (voltageSet > 0) voltageSet -= 0.1;
      voltageSet = voltageSet.toFixed(2);
      voltageSet = parseFloat(voltageSet);
      $("#voltageSet").html(voltageSet);
      to = setTimeout(function () {
          int = setInterval(function () {
              if (voltageSet > 0) voltageSet -= 0.1;
              voltageSet = voltageSet.toFixed(2);
              voltageSet = parseFloat(voltageSet);
              $("#voltageSet").html(voltageSet);
          }, 75);
      }, 500);
    }).on("mouseup touchend", function () {
      socket.emit("setVoltage", voltageSet);
      console.log('emitting: '+ voltageSet);
      clearTimeout(to);
      clearInterval(int);
  });

  socket.on('voltage', function(mt) {
   // console.log(t); 
    $('#voltage').html(mt); 
    console.log('received: '+ mt);           
  });

});  

