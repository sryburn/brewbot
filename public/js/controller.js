$(document).ready(function() {
  var socket = io.connect();
  var buttonDiv = document.querySelector('#button');
  var to = null;
  var int = null;

  $("[name='my-checkbox']").bootstrapSwitch();

  $('input[name="pump1"]').on('switchChange.bootstrapSwitch', function(event, state) {
  socket.emit('togglePump1');
  });

  $("#boilPlus").on("mousedown touchstart", function (bp) {
    bp.preventDefault();
    boilVal = $('#boilPower').html();
    if (boilVal < 100) boilVal++;
      $("#boilPower").html(boilVal);
      to = setTimeout(function () {
          int = setInterval(function () {
              if (boilVal < 100) boilVal++;
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
              if (boilVal > 0) boilVal--;
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
    mashSet = $('#mashSet').html();
    if (mashSet < 100) mashSet++;
      $("#mashSet").html(mashSet);
      to = setTimeout(function () {
          int = setInterval(function () {
              if (mashSet < 100) mashSet++;
              $("#mashSet").html(mashSet);
          }, 75);
      }, 500);
    }).on("mouseup touchend", function () {
      socket.emit("setMashTemp", mashSet);
      clearTimeout(to);
      clearInterval(int);
  });

  $("#mashMinus").on("mousedown touchstart", function (mm) {
    mm.preventDefault();
    mashSet = $('#mashSet').html();
    if (mashSet > 0) mashSet--;
      $("#mashSet").html(mashSet);
      to = setTimeout(function () {
          int = setInterval(function () {
              if (mashSet > 0) mashSet--;
              $("#mashSet").html(mashSet);
          }, 75);
      }, 500);
    }).on("mouseup touchend", function () {
      socket.emit("setMashTemp", mashSet);
      clearTimeout(to);
      clearInterval(int);
  });

  socket.on('pump1', function(p1) {
    if (p1 == "high") $('input[name="pump1"]').bootstrapSwitch('state', true, true);
    else $('input[name="pump1"]').bootstrapSwitch('state', false, true);            
  });

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
   // console.log(t); 
    $('#mashSet').html(mt);            
  });

  socket.on('mashElementState', function(mo) {
      if (mo == 'On') $('#mashLabel').css('border-bottom', '1px solid red');
      else $('#mashLabel').css('border-bottom', '1px solid white');
  });

  socket.on('boilElementState', function(bo) {
      if (bo == 'On') $('#boilLabel').css('border-bottom', '1px solid red');
      else $('#boilLabel').css('border-bottom', '1px solid white');
  });

  socket.on('boilPower', function(bp){
    $('#boilPower').html(bp);
  })

  socket.on('mashPower', function(p) {
   // console.log(t); 
    $('#mashPower').html(p);            
  });

});  

