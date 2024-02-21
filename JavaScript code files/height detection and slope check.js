var h1,h2,t1,t2 = null;
var latestPressureData = null;
var event = " ";
fname ="slope";

Bangle.setBarometerPower(true);

Bangle.on('pressure', function (pressureData) {
  latestPressureData = pressureData;
});


function check_slope() {
  stopInterval();
  console.log("check_slope_activated");
  let h1_p = latestPressureData.altitude;
  let t1_p = 0|getTime();

  setTimeout(function() {
  let h2_p = latestPressureData.altitude;
  let t2_p = getTime();
  console.log("h1_p = ",h1_p);
  console.log("h2_p = ",h2_p); 
  console.log("t1_p = ",t1_p);
  console.log("t2_p = ",t2_p);
  console.log("h2-h1",Math.abs(h2-h1));
  console.log("t2-t1",t2-t1);
  let m = Math.abs(h2-h1)/(t2-t1);
  console.log('slope=',m);
  var f = require("Storage").open(event + "." + fname + ".csv", "a");
  f.write(m + "\n");
  startInterval();
  //Bangle.setBarometerPower(false);
  console.log("swipe deactivated");
  },10000);
}



function height_check(){
  h1 = latestPressureData.altitude;
  t1 = 0|getTime();
  setTimeout(function() {
  h2 = latestPressureData.altitude;
  t2 = getTime();
  if((h2-h1) > 3){check_slope();
                 }
  console.log("got data");
  console.log("h1 = ",h1);
  console.log("h2 = ",h2); 
  console.log("t1 = ",t1);
  console.log("t2 = ",t2);
  console.log("h2-h1",h2-h1);
  console.log("t2-t1",t2-t1);
  } , 2000);

}

// Function to start the interval
function startInterval() {
    height_check_Interval = setInterval(height_check, 3000);
}

function stopInterval() {
    clearInterval(height_check_Interval);
}

var height_check_Interval = setInterval(height_check, 3000);









