const indicator = "Cardinal"; //details[6];
const digital_scale = "";
const { ReadlineParser } = require("@serialport/parser-readline");
var net = require("net");
const fs = require("fs");
const cors = require("cors");
var express = require("express");
var app = express();
//const ConsoleWindow = require("node-hide-console-window");
const bodyParser = require("body-parser");
var token = "";
//app.use(bodyParser.json());
app.use(bodyParser.json({ type: "*/*" }));
//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.json());
const RDU = require("./serialout.js");
const RDU1 = require("./serialout1.js");
const RDU2 = require("./serialout2.js");
const RDU3 = require("./serialout3.js");
const RDU4 = require("./serialout4.js");
const RDU5 = require("./serialout5.js");
var sockets = [];
var port = 3030;
var remoteHost = "127.0.0.1";
var remotePort = 3030;
var SCALE = [];
var results = "No Value";
var server = details[12];
var weightaken = 0;
var scanned = 0;
var scan = 0;
var inserted = 0;
var prog = 0;
var stationcode = details[2]; //details[2];
//console.log(stationcode);
var scalestatus = "";
var HOST = details[9];
var PORT = details[10];
const tcpClient = new net.Socket();
let readings = "0 kg, 0 kg, 0 kg,  0 kg,";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var autoweighReturn = JSON.stringify({});
const json2 = JSON.stringify({
  email: "admin@admin.com",
  password: "@Admin123",
});
var headers = {
  headers: {
    "Content-Type": "application/json",
  },
};
axios
  .post(server + "/api/AuthManagement/Login", json2, headers)
  .then((resp) => {
    console.log(resp.data.token);
    return resp.data.token;
  })
  .catch((e) => {
    console.log(e + server + "/api/AuthManagement/Login");
  });
function getToken() {
  const json2 = JSON.stringify({
    email: "admin@admin.com",
    password: "@Admin123",
  });
  var headers = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  axios
    .post(server + "/api/AuthManagement/Login", json2, headers)
    .then((resp) => {
      console.log(resp.data.token);
      return resp.data.token;
    })
    .catch((e) => {
      console.log(e + server + "/api/AuthManagement/Login");
    });
}
console.log("started tcp");
//var dd = setInterval((err) => {
try {
  dconnect = tcpClient.connect(PORT, HOST, (err) => {
    //if (err) throw err;
    console.log("Connected " + HOST + ": " + PORT);
    var isend = 0;
    runsend = setInterval((err) => {
      //if (err) throw err;
      //
      isend++;
      tcpClient.on("data", function (data) {
        var str = String(data);
        str = str.replace(/\s/g, "");
        readings = str + " kg, 0 kg, 0 kg,  0 kg,";
        console.log("" + str);
        // sleep.sleep(5);
        //client.destroy();
      });
    }, 1000);
  });
} catch (e) {
  tcpClient.end();
}
const udp = require("dgram");
const { Console } = require("console");
const client = udp.createSocket("udp4");
client.bind(13805);
//buffer msg
const data = Buffer.from("#01\r");
client.on("message", (msg, info) => {
  var str = "";
  var va = 0;
  Array.from(msg.slice(24, msg.length), function (byte) {
    //str+=va+" "+(byte & 0xFF).toString(16)+" ";
    var sadio = (byte & 0xff).toString(16);
    if (sadio.length == 1) {
      str += "0" + (byte & 0xff).toString(16) + " ";
    } else {
      str += (byte & 0xff).toString(16) + " ";
    }
    va++;
  }).join("");
  console.log(" end");
  console.log(str);
  var weih = str.split(" ");
  var weightv = new Array(4);
  weightv[0] = "";
  weightv[1] = "";
  weightv[2] = "";
  weightv[3] = "";
  var g = 120;
  for (var i = 0; i < 4; i++) {
    var stable = weih[g];
    //if (stable==1){

    weightv[i] = getweight(
      "0x" + weih[g + 4] + weih[g + 3] + weih[g + 2] + weih[g + 1],
    );
    console.log(weightv[i]);
    //}

    g = g + 5;
  }
  readings =
    "  " +
    weightv[0] +
    " kg," +
    weightv[1] +
    " kg," +
    weightv[2] +
    " kg," +
    weightv[3] +
    " kg, ";
  RDU1.readings = readings;
  RDU2.readings = readings;
  RDU3.readings = readings;
  RDU4.readings = readings;
  RDU5.readings = readings;
  //console.log("Data received from server : " + msg.slice(24,msg.length).toString());
  // console.log(
  //   "Received %d bytes from %s:%d\n",
  //   msg.length,
  //   info.address,
  //   info.port,
  // );
});
// console.log("stationcode:" + stationcode);
//sending msg
//client.send(data, 1025, '10.0.0.122', error => {
//if (error) {
//    console.log(error)
//    client.close()
//} else {
//    console.log('Data sent !!!')
//}
//});

// get port name from the command line:

// list serial ports:
//let portName = process.argv[2];
//let baudrate = process.argv[3];
let portName = details[8];
let baudrate = 9600;
//  ..let readings = "  10000 kg, 10000 kg, 10000 kg,  10000 kg,";
//let readings = "  0 kg, 5900 kg,19500 kg,  0 kg,";
readings = " 0 kg,0 kg, 0 kg,0 kg, ";

//let readings = "000 kg,";
// SerialPort.list().then(function (ports) {
//   ports.forEach(function (port) {
//     console.log("Port: ", port.path);
//     portName = port.path;
//   });
// });
var runsend = "";
// console.log(portName);
const myPort = new SerialPort({
  path: "COM1",
  baudRate: 9600,
});
//parser: SerialPort.parsers.readline("\n")
const parser = myPort.pipe(new ReadlineParser({ delimiter: "\r" }));
//parser: new Readline("\n")
//Readline = SerialPort.parsers.Readline;
//let parser = new Readline();
//myPort.pipe(parser);
myPort.on("open", showPortOpen);
parser.on("data", readSerialData);
//myPort.on("close", showPortClose);
myPort.on("error", showError);
function showPortOpen() {
  console.log("port open." + portName + " Data rate: " + myPort.baudRate);
  runsend = setInterval((err) => {
    if (err) throw err;
    myPort.write([5]);
  }, 1000);
  //myPort.write("5\n");
}

/*function readSerialData(data) {
if(indicator=="Cardinal" && data.length >89){
var mydata=data.substring(0,90);

const deckW = mydata.split(",");
var a = 0;
var b = 0;
var c = 0;
var d = 0;
var dd= "";
for(var i=0;i<4;i++){

try {

var dec1= deckW[i].substring(0,deckW[i].length-10).trim();

dd+=dec1+" kg,";



}catch(exception){
}

}
module.exports.readings =dd;
readings =dd;
RDU.readings =dd;
}

if(indicator!="Cardinal"){


readings = data + ",";
RDU.readings = data + ",";
module.exports.readings = data + ",";
//console.log(readings);
}
RDU1.readings = data.trim() + ",";
RDU2.readings = data.trim() + ",";
RDU3.readings = data.trim() + ",";
RDU4.readings = data.trim() + ",";
RDU5.readings = data.trim() + ",";

}
*/
function readSerialData(data) {
  var reads = data;

  if (indicator == "Cardinal") {  // && data.length > 89 for true cardinal
    //var mydata = data.substring(0, 90);//for true cardinal
    console.log("-------------------------------Starts here---------------------");
    console.log(data);
    var mydata = data;
    const deckW = mydata.split(",");
    var a = 0;
    var b = 0;
    var c = 0;
    var d = 0;
    var dd = "";
    for (var i = 0; i < 4; i++) {
      try {
        //var dec1 = deckW[i].substring(0, deckW[i].length - 10).trim();//
        var dec1 = deckW[i].trim().replace(/[^\d.-]/g, '');
        dd += dec1 + " kg,";
      } catch (exception) {}
    }
    module.exports.readings = dd;
    readings = dd;
    RDU.readings = dd;
    reads = dd;
    console.log(dd);
  }

  if (indicator != "Cardinal") {
    readings = data + ",";
    RDU.readings = data + ",";
    module.exports.readings = data + ",";
    reads = data + ",";
    //console.log(readings);
  }

  RDU1.readings = reads.trim();
  RDU2.readings = reads.trim();
  RDU3.readings = reads.trim();
  RDU4.readings = reads.trim();
  RDU5.readings = reads.trim();
}
function getweight(str) {
  var float = 0,
    sign,
    order,
    mantiss,
    exp,
    int = 0,
    multi = 1;
  if (/^0x/.exec(str)) {
    int = parseInt(str, 16);
  } else {
    for (var i = str.length - 1; i >= 0; i -= 1) {
      if (str.charCodeAt(i) > 255) {
        console.log("Wrong string parametr");
        return false;
      }
      int += str.charCodeAt(i) * multi;
      multi *= 256;
    }
  }
  sign = int >>> 31 ? -1 : 1;
  exp = ((int >>> 23) & 0xff) - 127;
  mantiss = ((int & 0x7fffff) + 0x800000).toString(2);
  for (i = 0; i < mantiss.length; i += 1) {
    float += parseInt(mantiss[i]) ? Math.pow(2, exp) : 0;
    exp--;
  }
  console.log(float * sign);
  return Math.floor((float * sign + 5) / 10) * 10;
}
function showPortClose() {
  console.log("port closed.");
}

function showError(error) {
  console.log("Serial port error: " + error);
}
function getcurrentdate() {
  let d = new Date();
  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  let date = d.getDate();
  date = getv(date);
  month = getv(month);

  let hour = d.getHours();
  let min = d.getMinutes();
  let sec = d.getSeconds();
  hour = getv(hour);
  min = getv(min);
  sec = getv(sec);

  //const msec = d.getMilliseconds();
  const datetime =
    year + "-" + month + "-" + date + "T" + hour + ":" + min + ":" + sec;
  return datetime;
}
function getv(val) {
  if (val < 10) {
    val = "0" + val;
  }
  return val;
} //var stayawake = require('./stayawakeHaenni.js');
async function callseeweight() {
  //check Haenni webserver
  ///stayawake;
  //set scale ids
  // console.log(stayawake.devices);


  var deckW = readings.split(",");
  //document.getElementById('consoleSpace').innerHTML = readings + " " + details[12] + " " + details[2] + " " + details[9] + " " + details[10];
  var a = 0;
  var b = 0;
  var c = 0;
  var d = 0;

  try {
    //a = Number(deckW[0].replace("kg", "").trim());
    a = Number(deckW[0].replace("kg", "").trim());
    b = Number(deckW[1].replace("kg", "").trim());
    c = Number(deckW[2].replace("kg", "").trim());
    d = Number(deckW[3].replace("kg", "").trim());
  } catch (exception) {}

  tot = a + b + c + d;

 

}
function setrec() {
  prog = 0;
}

var dsp = null;
dsp = setInterval((err) => {
  if (err) throw err;

  callseeweight();
}, 100); //details[11]);
//app.use(express.json());
app.post("/weights", cors(), (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  console.log("Got body:", req.body);
  weightaken = req.body.weightaken;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end("Done");
  //UPDATE AUTOWEIGH
 // autoweighReturn.autostatus = "W";
 // autoweighReturn.wbt_no = req.body.wbrg_ticket_no;
 // autoweighReturn.weighdate = req.body.wbrg_ticket_dateout;
 // autoweighReturn.nplate = req.body.nplate;
 // autoweighReturn.wbtno = req.body.Weighbridgetransactionsid;
  /**
  *  wbrg_ticket_no: 'ROMIA202209000004',
  wbrg_ticket_gvwload: 0,
  wbrg_ticket_axleload: 0,
  wbrg_ticket_grossweight: 9770,
  wbrg_ticket_dateout: '2022-09-15T14:46:32',
  wbrg_ticket_axel: '2A',
  Weighbridgetransactionsid: 1162313,
  timestamp: '2022-09-15T14:46:32',
  nplate: 'TESTNO2',
  weightaken: 1
  */

 /* token = getToken();
  var headers = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  axios
    .put(
      server + "/api/autoweigh/" + autoweighReturn.id,
      autoweighReturn,
      headers,
    )
    .then((resp) => {
      console.log(resp.data);
    })
    .catch((e) => {
      console.log(e);
    });*/
});
app.post("/scan", cors(), (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  // console.log("Got body:", req.body);
  scanned = req.body.scanned;
  scan = 0;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end("Done");
});
app.get("/weights", cors(), function (req, res) {
  // Webdriver test case code
  res.set("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  results =
    stationcode +
    "*" +
    weightaken +
    "*" +
    readings +
    "*" +
    scalestatus +
    "*" +
    scan;
  //console.log('Got body:', req.body);
  // send results or render custom UI
  res.send(results);
});
// http://localhost:3000
app.listen(3031, () => console.log("Listening!"));
module.exports = {
  readings: readings,
};