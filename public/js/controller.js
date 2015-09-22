$(document).ready(function() {
  var socket = io.connect();
  var to, int;

 function onOff (event){
    event.preventDefault();
    $(event.data.htmlElement).html(event.data.payload);
    socket.emit(event.data.message, event.data.payload);
    console.log('emitting: '+ event.data.message + ' ' + event.data.payload);
  }

  function upDownPress (event){
    var max = event.data.max || 100;
    var min = event.data.min || 0;
    var direction = event.data.direction || 1;
    var slowIncrement = (event.data.slowIncrement * direction) || (1* direction);
    var fastIncrement = (event.data.fastIncrement * direction) || (5* direction);
    var precision = event.data.precision || 0;
    var fastIncrementTime = event.data.fastIncrementTime || 75;

    event.preventDefault();
    value = parseFloat($(event.data.htmlElement).html());
    value += slowIncrement;
    if (value < min) value = min;
    if (value > max) value = max;
    value = value.toFixed(precision);
    value = parseFloat(value);
    $(event.data.htmlElement).html(value);

    to = setTimeout(function () {
      int = setInterval(function () {
        value += fastIncrement;
        if (value < min) value = min;
        if (value > max) value = max;
        value = value.toFixed(precision);
        value = parseFloat(value);
        $(event.data.htmlElement).html(value);
      }, fastIncrementTime);
    }, 500);
  }

  function upDownRelease(event) {
    value = parseFloat($(event.data.htmlElement).html());
    socket.emit(event.data.message, value);
    console.log('emitting: '+ value);
    clearTimeout(to);
    clearInterval(int);
  };

  socket.on('temps', function(t) {
    console.log("temps: " + JSON.stringify(t)); 
    $('#mashTemp').html(Number(t.mashTemp).toFixed(1));
    $('#hltTemp').html(Number(t.hltTemp).toFixed(1));
    $('#boilTemp').html(Number(t.boilTemp).toFixed(1)); 
    $('#chillerTemp').html(Number(t.chillerTemp).toFixed(1));             
  });

  socket.on('pidOutput', function(po) {
      if (po.mashElementState == 'on') $('#mashLabel').css('border-bottom', '1px solid red');
      else $('#mashLabel').css('border-bottom', '1px solid white');

      if (po.boilElementState == 'on') $('#boilLabel').css('border-bottom', '1px solid red');
      else $('#boilLabel').css('border-bottom', '1px solid white');

      $('#mashPower').html(po.mashPower); 
  });

  socket.on('mashSet', function(mt) {
    console.log("mash set: " + mt); 
    $('#mashSet').html(mt);            
  });

  socket.on('chartUrl', function(url) {
    $('#chart').attr('src', url)           
  });  

  socket.on('boilPower', function(bp){
    $('#boilPower').html(bp);
  })

  socket.on('pump1Voltage', function(p1v) {
    $('#pump1VoltageSet').html(p1v); 
    console.log('received: '+ p1v);           
  });

  socket.on('pump2Voltage', function(p2v) {
    $('#pump2VoltageSet').html(p2v); 
    console.log('received: '+ p2v);           
  });
  
  $('#pump1On').click({htmlElement: "#pump1VoltageSet", message: "setPump1Voltage", payload: 5}, onOff);
  $('#pump1Off').click({htmlElement: "#pump1VoltageSet", message: "setPump1Voltage", payload: 0}, onOff);
  $('#pump2On').click({htmlElement: "#pump2VoltageSet", message: "setPump2Voltage", payload: 5}, onOff);
  $('#pump2Off').click({htmlElement: "#pump2VoltageSet", message: "setPump2Voltage", payload: 0}, onOff);

  $("#pump1On, #pump1Off, #pump2On, #pump2Off").mouseup(function(){
    $(this).blur();
  })

  $("#pump1VoltagePlus")
  .on("mousedown touchstart", {
    htmlElement: "#pump1VoltageSet", 
    max: 5, 
    fastIncrement: 0.1,
    slowIncrement: 0.1, 
    precision: 2 
  }, upDownPress)
  .on("mouseup touchend", {
    message: "setPump1Voltage",
    htmlElement: "#pump1VoltageSet"
  }, upDownRelease);

  $("#pump1VoltageMinus")
  .on("mousedown touchstart", {
    htmlElement: "#pump1VoltageSet", 
    max: 5,
    fastIncrement: 0.1,
    slowIncrement: 0.1,
    direction: -1,  
    precision: 2 
  }, upDownPress)
  .on("mouseup touchend", {
    message: "setPump1Voltage",
    htmlElement: "#pump1VoltageSet"
  }, upDownRelease);

  $("#pump2VoltagePlus")
  .on("mousedown touchstart", {
    htmlElement: "#pump2VoltageSet", 
    max: 5, 
    fastIncrement: 0.1,
    slowIncrement: 0.1, 
    precision: 2
  }, upDownPress)
  .on("mouseup touchend", {
    message: "setPump2Voltage",
    htmlElement: "#pump2VoltageSet"
  }, upDownRelease);

  $("#pump2VoltageMinus")
  .on("mousedown touchstart", {
    htmlElement: "#pump2VoltageSet", 
    max: 5,
    fastIncrement: 0.1,
    slowIncrement: 0.1,
    direction: -1,   
    precision: 2
  }, upDownPress)
  .on("mouseup touchend", {
    message: "setPump2Voltage",
    htmlElement: "#pump2VoltageSet"
  }, upDownRelease);

  $("#boilPlus")
  .on("mousedown touchstart", {
    htmlElement: "#boilPower" 
   }, upDownPress)
  .on("mouseup touchend", {
    message: "setBoilPower",
    htmlElement: "#boilPower"
  }, upDownRelease);

  $("#boilMinus")
  .on("mousedown touchstart", {
    htmlElement: "#boilPower",
    direction: -1 
  }, upDownPress)
  .on("mouseup touchend", {
    message: "setBoilPower",
    htmlElement: "#boilPower"
  }, upDownRelease);

  $("#mashPlus")
  .on("mousedown touchstart", {
    htmlElement: "#mashSet",
    fastIncrement: 0.5,
    slowIncrement: 0.1,
    fastIncrementTime: 25, 
    precision: 2  
   }, upDownPress)
  .on("mouseup touchend", {
    message: "setMashTemp",
    htmlElement: "#mashSet"
  }, upDownRelease);

  $("#mashMinus")
  .on("mousedown touchstart", {
    htmlElement: "#mashSet",
    fastIncrement: 0.5,
    slowIncrement: 0.1,
    fastIncrementTime: 25,
    precision: 2,   
    direction: -1 
  }, upDownPress)
  .on("mouseup touchend", {
    message: "setMashTemp",
    htmlElement: "#mashSet"
  }, upDownRelease);

});  

