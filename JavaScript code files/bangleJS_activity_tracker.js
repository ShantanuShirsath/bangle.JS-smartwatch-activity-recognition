// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);
// position on screen
const X = 170, Y = 100;
var latestAccelData = null;
var latestPressureData = null;
var latestHRMData = null;
var accelerationData = [];
var pressureDataCollection = [];
var collectDataInterval;
var variance = [];
var ti,tf = 0;
var points = 0;
var img = require("heatshrink").decompress(atob("oFAxH+AH4A/AH4A/AH4A/AD2X3YMLy48uAAwMRHsu74XJAAPC4QzEAgIIBBoe7IFAwBF4QADIAZLBBgwNCH1xAEHxAABQMqvCGRJABBhg/j3ZxKGYQMLZwS+sAB7AkH7TAkP/4kBP3iAaH8+7H62XH8qAXP0wAB3ZAUHwI/nIALBSH1TBUSgI+pICQ+tICDRBH1pAOH2JAL4S8vAAp0BIIvCy4+0QISCEH3BAFH3TCCHgI96QQglk0YAFMWo5D0mk1QABIWg8D53VAAvP5xBuHgeqHgwAFINYqC1XPHphBt0g8RAAmqIMr1HIMgQCKZ4/aIJw8D0hTQH7nV54vCHpA8B5wABIAZDLH7pBGGIY8D52kBApVIH8JBCGgx6EQYiFGH7nPBZXOGwJ6IHo+qB4Q/a54dBDJRuEPQ44C1RdDEQR/aOYImCJpR6LTYwLBf7hBDDowKBHwh6DZIKjKH5pKQIJA3BPRx/R54eEIJ4UD5waDPRzUGH5HODwQAEMBhBHCoJBDDJycCHwQ/EEYgMD/xBT56ABAgTaSGIjXFBQhBH0gsPACA9DGY49MCAzzBHrfPdgYzNIKOqPbA9fIJDGTPcBCLIKA9pII2kIJY9tII/OHvBBG0ZBDHupBHHgY91II495AH4A/ADoA=="));
var smile = require("heatshrink").decompress(atob("oFAwkBiIA/AFUQOwpzXTBI8YEw5CRDwZIKECASMFgQebECIPBKBwQOWSIRMHyASOeKYTKHyQUMHyYVLHyZADBB5APGwwHFJwIPHF4JaFG44XECYRwHBQ4fGAwitDWIwKJB44EMJwwfKBRAfKF4qYFD4h5FAhAFEF5QAUD4weXIhYfWLQQf/YgqgWD5UAABgfQMwIAMCgwfqQxgUKD6hfTD+4YFD6gGDD8wLBD5gmKBZbeHGZZLKD5wGFD77gSbxTAUKRiMIMBAROQCBRONo5gICBwuIIAwIHKBAPHJ46wPCBCvGFxoRLA4QMBNxxALAAg+PFZIgEBQ4+JFhQIRFqQQSKw4eIHxggPDyKaEFZJuPXY4dGDyQYGAAodTIQ48WAH4AX"));
var sad = require("heatshrink").decompress(atob("oFAwkBiIA/AFUQOwpzXTBI8YEw5CRDwZIKECASMFgQebECIPBKBwQOWSIRMHyASOeKYgBHzYUMHyYVLHyZgKNJRANGww+VG5IfeLy44HD8BeWDI5+XLI7GROI4fGBg4gHBJIaDcpAfLfJQfKBKIfjNY5fSDYYfHCoS/HFJIfKBBISNCxIARD/4f/D4jWIACLnDD5j5BAAIfZBQIAEOBIKED5AeGEBQaEBw4eCBIgHHLQ4NHPJIJHD4rgGKxRBCbxCgISxQSNBg74MGRY5LABb5HD74HHAB43IICo2JfJI+MCpApBICQULICYTLICQSNICIRNICAQPFwIPMDwJQPEBgeRCQYTIBQTwREAYhEA4YeRDAwAFDqZCHHiwA/AC4A="));

Bangle.setHRMPower(1);
Bangle.setBarometerPower(true);

function draw() {

  // Creating Variables for time and minutes
  var h = d.getHours(), m = d.getMinutes();
  var time = (" "+h).substr(-2) + ":" + m.toString().padStart(2,0);
  // Reset the state of the graphics library
  g.reset();
  g.clear();
  // draw the current time (4x size 7 segment)
  g.setFont("7x11Numeric7Seg",5);
  g.setFontAlign(1,1); // align right bottom
  g.drawString(time, X, Y, true /*clear background*/);
  if (h == 0 & m == 0){points = 0;}

}

function collectData() {
    // Store data in the form of dictionary
   accelerationData.push({
    alt: latestPressureData.altitude, 
    HR: latestHRMData.bpm,
    x: latestAccelData.x,
    y: latestAccelData.y,
    z: latestAccelData.z
  });

}


function calculateVariance() {
  var sumX = 0, sumY = 0, sumZ = 0,sumHR = 0;

  for (var i = 0; i < accelerationData.length; i++) {
    sumHR += accelerationData[i].HR;
    sumX += accelerationData[i].x;
    sumY += accelerationData[i].y;
    sumZ += accelerationData[i].z;
  }


  //Calculating Mean
  var meanX = sumX / accelerationData.length;
  var meanY = sumY / accelerationData.length;
  var meanZ = sumZ / accelerationData.length;
  var meanHR = sumHR / accelerationData.length;



  var varianceX = 0, varianceY = 0, varianceZ = 0;
  //Calculating Variance
  for (var j = 0; j < accelerationData.length; j++) {
    varianceX += Math.pow(accelerationData[j].x - meanX, 2);
    varianceY += Math.pow(accelerationData[j].y - meanY, 2);
    varianceZ += Math.pow(accelerationData[j].z - meanZ, 2);
  }
  //Calculating Slope
  slope = (accelerationData[0].alt - accelerationData[accelerationData.length - 1].alt)/15;
  slope = Math.abs(slope);

  data = [meanHR,varianceX / accelerationData.length, varianceY / accelerationData.length, varianceZ / accelerationData.length,slope];
  //console.log(data);
  // Do something with the variance values
  console.log("Variance X: " + data[1]);
  console.log("Variance Y: " + data[2]);
  console.log("Variance Z: " + data[3]);
}


function predict(){
    //slope = (accelerationData[0].alt - accelerationData[accelerationData.length - 1].alt)/15;
    console.log("slope:",slope);  // Slope calculated in varience function
    //Weights from our Model
    let W = [3.74321707e-03,1.67484426e+01,1.35900457e+01,4.05122938e+00,-1.44054391e+01];

    // Arrow function to calculate Dot product
    dot = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);

    // Calculating the prediction value using Logistic model
    current_pred = dot(W,data)+2.417971358069081;
    console.log("current_pred:",current_pred);
    current_pred = 1/(1+ Math.exp(-current_pred));
    console.log("soft_max:",current_pred);

    // Setting the condition for Classification
    prediction = (current_pred>0.5);
    console.log("using stairs:", prediction);

    // Show the prediction and store the points
    if(prediction) {
    points+=5;
    show_pred(prediction);
    }
    else {
    points-=2.5;
    show_pred(prediction);
    }
}

function displayHealthpoints() {
  console.log("stroke");
  g.reset();
  g.clear();
  g.setFont("6x8",2);
  g.setFontAlign(0,0); // align center
  g.drawString("Health Points", g.getWidth()/2, g.getHeight()/2 - 60, true /*clear background*/);
  g.drawImage(img,g.getWidth()/2 -30, g.getHeight()/2 - 40, true /*clear background*/);
  g.drawString("Total Points:", g.getWidth()/2, g.getHeight()/2 + 20, true /*clear background*/);
  g.setFont("6x8",3);
  g.drawString(points, g.getWidth()/2, g.getHeight()/2 + 40, true /*clear background*/);
}




function height_check(){
  h1 = latestPressureData.altitude;
  t1 = 0|getTime();
  setTimeout(function() {
  h2 = latestPressureData.altitude;
  t2 = getTime();

  // If statement to activatre the prediction phase
  if(Math.abs(h2-h1) > 0.5){
    stopInterval(); // height check stopped

    //collect Data every 0.5 sec for 15 sec
    var collection_interval = setInterval(collectData,500);

    var data_collection = setTimeout(function() {

      //prediction sequence after 15 seconds
      clearTimeout(data_collection);
      calculateVariance();
      predict();
      accelerationData = [];
      console.log("prediction done");
      clearTimeout(collection_interval);
      startInterval();
      }, 15000); 
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


function show_pred(x){
  if(x == 1){
  g.reset();
  g.clear();
  g.setFont("6x8",2);
  g.drawImage(smile, g.getWidth()/2-30, g.getHeight()/2 - 70, true /*clear background*/);
  g.drawString("you used:", g.getWidth()/2-50, g.getHeight()/2, true /*clear background*/);
  g.setFont("6x8",4);
  g.setFontAlign(0,0); // align center
  g.setColor(0,0,1);
  g.drawString("Stairs", g.getWidth()/2, g.getHeight()/2 +50, true /*clear background*/);
  Bangle.buzz().then(()=>{
  return new Promise(resolve=>setTimeout(resolve,500)); // wait 500ms
  }).then(()=>{
  console.log("Done");
  });
  }
  else{
    g.reset();
  g.clear();
  g.setFont("6x8",2);
  g.drawImage(sad, g.getWidth()/2-30, g.getHeight()/2 - 70, true /*clear background*/);
  g.drawString("you used:", g.getWidth()/2-50, g.getHeight()/2, true /*clear background*/);
  g.setFont("6x8",4);
  g.setFontAlign(0,0); // align center
  g.setColor(0,0,1);
  g.drawString("Lift", g.getWidth()/2, g.getHeight()/2 +50, true /*clear background*/);
  Bangle.buzz().then(()=>{
  return new Promise(resolve=>setTimeout(resolve,500)); // wait 500ms
  }).then(()=>{
  console.log("Done");
  });
  }
}

Bangle.on('accel', function (accelData) {
  latestAccelData = accelData;
});

Bangle.on('pressure', function (pressureData) {
  latestPressureData = pressureData;
});

Bangle.on('HRM', function(HRMData) {
  latestHRMData = HRMData;
});

Bangle.on('stroke', displayHealthpoints);

function startInterval() {
    height_check_Interval = setInterval(height_check, 3000);
}

function stopInterval() {
    clearInterval(height_check_Interval);
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();
// now draw every 5 second
var secondInterval = setInterval(draw, 5000);
var height_check_Interval = setInterval(height_check, 3000);
