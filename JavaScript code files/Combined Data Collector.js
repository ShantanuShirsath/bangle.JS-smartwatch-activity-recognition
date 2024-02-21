var event = "combined_data";
var fname = 1;
var latestAccelData = null;
var latestPressureData = null;
var latestHRMData = null;

function gotData() {
  if (latestAccelData !== null && latestPressureData !== null) {
    // Open file in append mode
    var f = require("Storage").open(event + "." + fname + ".csv", "a");

    // Create an Array with combined data in csv format
    var csv = [
      0 | getTime(), // Time to the nearest second
      latestAccelData.x,
      latestAccelData.y,
      latestAccelData.z,
      latestPressureData.pressure,
      latestPressureData.altitude,
      latestHRMData.bpm
    ];

    print(csv + "\n");

    // Write data to the file
    f.write(csv.join(",") + "\n");
  }
}

// Create an event listener for acceleration data
Bangle.on('accel', function (accelData) {
  latestAccelData = accelData;
  gotData();
});

// Create an event listener for pressure data
Bangle.on('pressure', function (pressureData) {
  latestPressureData = pressureData;
  gotData();
});

Bangle.on('HRM', function(HRMData) {
  latestHRMData = HRMData;
  gotData();
});

// Enable barometer power for pressure data
Bangle.setBarometerPower(true);
Bangle.setHRMPower(1);