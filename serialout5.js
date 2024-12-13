const SerialPort = require("serialport").SerialPort;; // include the library

// get port name from the command line:

// list serial ports:
//let portName = process.argv[2];
//let baudrate = process.argv[3];
let portName = "COM15";
let baudrate = 1200;
let readings = "  900 kg, 10800 kg, 4400 kg,  5500 kg,";
//let out = "$" + dsa + "," + dsb + "," + dsc + "," + dsd + "," + dse;
let out = "$=00000200=,=00000200=,=00000200=,=00000200=";
// SerialPort.list().then(function (ports) {
//   ports.forEach(function (port) {
//     console.log("Port: ", port.path);
//     //portName = port.path;
//   });
// });
var runsend = "";
console.log("baudrate" + baudrate);
const myPort = new SerialPort({
  path: portName,
  baudRate: baudrate,
})
// var myPort = new SerialPort('/dev/ttyAMA0', {
//   baudRate: 1200,
//   path:portName,
// });

//let Readline = SerialPort.parsers.Readline;
//let parser = new Readline();
//myPort.pipe(parser);

myPort.on("open", showPortOpen);
//parser.on("data", readSerialData);
myPort.on("close", showPortClose);
myPort.on("error", showError);
function showPortOpen() {
  console.log(portName + "port open. Data rate: " + myPort.baudRate);

  runsend = setInterval((err) => {
    if (err) throw err;
    //myPort.write("ACK\n");
    //myPort.write("G1\n");
    myPort.write(out, (err) => {
      if (err) return console.log("Error on write: ", err.message);
      //console.log("message written");
    });
  }, 500);
  //myPort.write("5\n");
}

function readSerialData(data) {
  console.log(data);
  //readings = data;
  //module.exports.readings = data;
  //console.log(readings);
}

function showPortClose() {
  console.log("port closed.");
}

function showError(error) {
  console.log("Serial port error: " + error);
}
var dsp = null;
dsp = setInterval((err) => {
  if (err) throw err;
  // console.log(readings);
  var deckweights = module.exports.readings.split("kg,");
  let dsa = "=000000000=",
    dsb = "=000000000=",
    dsc = "=000000000=",
    dsd = "=000000000=",
    dse = "=000000000=";
  //console.log("deckweights[0]" + deckweights[0]);
  //console.log("deckweights[1]" + deckweights[1]);
  //console.log("deckweights[2]" + deckweights[2]);
  //console.log("deckweights[3]" + deckweights[3]);
  try {
    dsa = mygetinverse(Number(deckweights[0].trim()) + "");
    //console.log("dsa" + dsa);
    dsb = mygetinverse(Number(deckweights[1].trim()) + "");
    dsc = mygetinverse(Number(deckweights[2].trim()) + "");
    dsd = mygetinverse(Number(deckweights[3].trim()) + "");
    var no =
      Number(deckweights[0].trim()) +
      Number(deckweights[1].trim()) +
      Number(deckweights[2].trim()) +
      Number(deckweights[3].trim());
  }
  catch (exception) {
    //
  }
  dse = mygetinverse(Number(no) + "");
  out = "" + dse;
  //out = "$" + dsa + "," + dsb + "," + dsc + "," + dsd + "," + dse;
  //out = "$=00000000=,=00000000=,=00000000=,=00000000=,=00000000=";
  console.log(out);
}, 1000);

module.exports = {
  readings: readings,
};
function mygetinverse(nwval) {
  let changestring = "";
  let addz = "";
  var addz2 = 0;
  var len = nwval.split("");
  //console.log("len" + len.length);

  addz2 = 8 - len.length;

  //console.log("addz2" + addz2);

  if (addz2 == 1) {
    addz = "0";
  }
  if (addz2 == 2) {
    addz = "00";
  }
  if (addz2 == 3) {
    addz = "000";
  }
  if (addz2 == 4) {
    addz = "0000";
  }
  if (addz2 == 5) {
    addz = "00000";
  }
  if (addz2 == 6) {
    addz = "000000";
  }
  if (addz2 == 7) {
    addz = "0000000";
  }
  //console.log("nwval" + nwval);
  let dd = nwval.split("").reverse().join(""); //getinverse(Number(nwval));
  //console.log("dd" + dd);
  //let s = padRight( dd+addz, 8);
  let s = dd + addz;
  changestring = "=" + s.replace(" ", "0") + "=";
  return changestring;
}

function padRight(s, n) {
  //console.log("S=>" + s);
  var text = s.toLocaleString("en-US", {
    minimumIntegerDigits: n,
    useGrouping: false,
  });
  return text;
}
