const axios = require("axios");

const SerialPort = require("serialport").SerialPort;
const { ReadlineParser } = require("@serialport/parser-readline");
var net = require("net");
const fs = require("fs");
const cors = require("cors");
var express = require("express");
var app = express();
const bodyParser = require("body-parser");
var scananpr = "";
var st = "Z1G 2        00kg";
const indicator = "1310";
console.log("eee" + st.substring(4, 5));
app.use(bodyParser.json({ type: "*/*" }));
const RDU = require("./serialout.js");
const RDU1 = require("./serialout1.js");
const RDU2 = require("./serialout2.js");
const RDU3 = require("./serialout3.js");
const RDU4 = require("./serialout4.js");
const RDU5 = require("./serialout5.js");
var results = "No Value";
var weightaken = 0;
var scanned = 0;
var scan = 0;
var veharrive = 0;
var inserted = 0;
var prog = 0;
var bidirectional = false;
var scandeck = "";
var stationcode = "WBELA";
var stationcode2 = "";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var autoweighReturn = JSON.stringify({});
var shortAlarm = 15;
var longAlarm = 16;
var autouser = "KenloadV2";
var token = "";

var headers = {
  headers: {
    "Content-Type": "application/json",
  },
};
var scalestatus = "";
const portNumber = 3031;
var scananpr="";
const serialPortName = 'COM6'; // Update to match your port name
const baudRate = 9600;
const enquiryCommand = Buffer.from([0x05]); // ENQ command in ASCII
var endpoint = "http://192.168.4.115:4444/api";
let readings = "  0 kg, 0 kg, 0 kg,  0 kg,";

let latestWeights = {
  scale1: null,
  scale2: null,
  scale3: null,
  scale4: null
};

let currentScale = null;

// Enable CORS for all routes
app.use(cors());

// Initialize the serial connection
const serialPort = new SerialPort(
  {
    path: serialPortName, // Make sure `path` is defined
    baudRate: baudRate,
  },
  (err) => {
    if (err) {
      return console.error(`Error opening serial port ${serialPortName}:`, err.message);
    }
    console.log(`Connected to ${serialPortName} at ${baudRate} baud.`);
  }
);

// Set up a parser to read the data line-by-line
const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Send enquiry command and listen for data
serialPort.on('open', () => {
  setInterval(() => {
    serialPort.write(enquiryCommand, (err) => {
      if (err) {
        return console.error('Error writing to serial port:', err.message);
      }
      console.log('Enquiry command sent.');
    });
  }, 2000); // Send the enquiry command every 2 seconds
});

parser.on('data',readSerialData);
function readSerialData(data) {
  var reads = data;
  if (indicator == "Cardinal" && data.length > 89) {
    var mydata = data.substring(0, 90);

    const deckW = mydata.split(",");
    var a = 0;
    var b = 0;
    var c = 0;
    var d = 0;
    var dd = "";
    for (var i = 0; i < 4; i++) {
      try {
        //var dec1 = deckW[i].substring(0, deckW[i].length - 10).trim();
        var decs = deckW[i].substring(0, 8).trim();

        dd += decs + " kg,";
      } catch (exception) {}
    }
    module.exports.readings = dd;
    readings = dd;
    RDU.readings = dd;
    reads = dd;
    //sendtoRDU(reads);
  }
  if (indicator == "Cardinal2") {
    var dec = data.substring(4, 5);

    if (dec == "1" || dec == "2" || dec == "3" || dec == "4") {
      if (dec == "1") {
        dec1 = data.substring(6, data.length - 2);
      }
      if (dec == "2") {
        dec2 = data.substring(6, data.length - 2);
      }
      if (dec == "3") {
        dec3 = data.substring(6, data.length - 2);
      }
      if (dec == "4") {
        dec4 = data.substring(6, data.length - 2);
      }
      dd = dec1 + " kg," + dec2 + " kg," + dec3 + " kg," + dec4 + " kg,";
    }
    
    module.exports.readings = dd;
    readings = dd;
    RDU.readings = dd;
    reads = dd;
  }
  if (indicator == "ZM") {
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
        dd += dec1 + "kg,";
      } catch (exception) {}
    }
    module.exports.readings = dd;
    readings = dd;
    RDU.readings = dd;
    reads = dd;
    console.log(dd);
  }
  if (indicator == "1310") {
    const scaleMatch = data.match(/Scale No:\s+(\d+)/);
    if (scaleMatch) {
      const scaleNumber = parseInt(scaleMatch[1], 10);
      currentScale = `scale${scaleNumber}`;
      console.log(currentScale)
    }
    const grossWeightMatch = data.match(/^G\s+(-?\d+)\s*kg/);
    if (grossWeightMatch && currentScale) {
      console.log(`matched gaw:${grossWeightMatch} <===>   scale:${currentScale} `)
      latestWeights[currentScale] = parseInt(grossWeightMatch[1], 10);
      readings = `${latestWeights.scale1 || 0} kg, ${latestWeights.scale2 || 0} kg, ${latestWeights.scale3 || 0} kg, ${latestWeights.scale4 || 0} kg,`;
      module.exports.readings=readings;
      RDU.readings=readings;
      reads=readings;
      console.log("Readings=>"+readings);
      currentScale = null; // Reset current scale
    }
  }
}
function sendtoRDU(reads) {
  RDU1.readings = reads.trim();
  RDU2.readings = reads.trim();
  RDU3.readings = reads.trim();
  RDU4.readings = reads.trim();
  RDU5.readings = reads.trim();
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

  const datetime =
    year + "-" + month + "-" + date + "T" + hour + ":" + min + ":" + sec;
  return datetime;
}
function getdatefolder(mydate) {
  let d = new Date(mydate);
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

  const datetime = year + month + "/" + date + "/" + hour + "/";
  return datetime;
}
function getv(val) {
  if (val < 10) {
    val = "0" + val;
  }
  return val;
}
function soundalarm(alarm) {
  token = getToken();
  var headers = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  axios
    .post(
      endpoint + "/autoweigh/alarm?ipaddress=192.168.0.3&alarm=" + alarm,
      autoweighReturn,
      headers,
    )
    .then((resp) => {
      console.log(resp.data);
    })
    .catch((e) => {
      console.log(e);
    });
  var exitwb = "deckAEntry";

  axios
    .post(endpoint + `/IOSettings/` + exitwb + `?Action=Open`, json, headers)
    .then(() => {})
    .catch((e) => {
      console.log(e + "Posting Start autoweigh");
    });
}
function getIPAddress() {
  var interfaces = require("os").networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (
        alias.family === "IPv4" &&
        alias.address !== "127.0.0.1" &&
        !alias.internal
      )
        return alias.address;
    }
  }
  return "0.0.0.0";
}
function callseeweight() {
  console.log("callseeweight=>"+readings)
  var deckW = readings.split(",");
  var a = 0;
  var b = 0;
  var c = 0;
  var d = 0;
  try {
    a = Number(deckW[0].replace("kg", "").trim());
    b = Number(deckW[1].replace("kg", "").trim());
    c = Number(deckW[2].replace("kg", "").trim());
    d = Number(deckW[3].replace("kg", "").trim());
  } catch (exception) {}
  tot = a + b + c + d;

  sendtoRDU(readings);
  if (tot < 100) {
    scandeck = "";
    if (veharrive == -1) {
      soundalarm(longAlarm);
      veharrive = 0;
    }
    scalestatus = "No Vehicle";
    prog = 0;
    if (weightaken == 1) {
      weightaken = 0;
    }
    if (scanned == 1) {
      scanned = 0;
    }
    if (veharrive > 0) {
      //Sound the alarm autoweigh
      var wbt_no = "";
      try {
        autoweighReturn.anpr = scananpr;
        wbt_no = autoweighReturn.wbt_no;
      } catch (Exception) {
        wbt_no = "";
      }

      if (wbt_no != "") {
        soundalarm(shortAlarm);
      } else {
        soundalarm(longAlarm);
      }
      token = getToken();
      var headers = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      axios
        .put(
          endpoint + "/autoweigh/" + autoweighReturn.id,
          autoweighReturn,
          headers,
        )
        .then((resp) => {
          console.log(resp.data);
        })
        .catch((e) => {
          console.log(e);
        });
      scananpr = "";
      veharrive = 0;
    }
  }
  var deckAScan = a;
  if (bidirectional && scanned == 0 && scan == 0) {
    deckAScan = 0;
    if (a > 100 && scandeck == "") {
      scandeck = "A";
    }
    if (d > 100 && scandeck == "") {
      scandeck = "D";
    }
    if (scandeck == "A") {
      deckAScan = d;
    }
    if (scandeck == "D") {
      deckAScan = a;
    }
  }
  if (deckAScan > 100 && scanned == 0 && scan == 0) {
    var stationc = stationcode;
    if (scandeck == "D") {
      stationc = stationcode2;
    }
    scan = 1;
    veharrive = 1;
    scalestatus = "Vehicle on deck 1";
    var autodatetime = getcurrentdate();
    var autoweighbridge = stationc;
    var anpr = "UKNOWN_ER";
    var anprb = "UKNOWN_NR";
    var autostatus = "N";

    token = getToken();
    headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    var header = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
    };
    var dir = getdatefolder(autodatetime);
    var decka = a;
    var deckb = b;
    var deckc = c;
    var deckd = d;

    if (scandeck == "D") {
      decka = a;
      deckb = b;
      deckc = c;
      deckd = d;
    }
    if (scandeck == "A") {
      deckd = a;
      deckc = b;
      deckb = c;
      decka = d;
    }
    var json = JSON.stringify({
      deck1: decka,
      deck2: deckb,
      deck3: deckc,
      deck4: deckd,
      gvw: tot,
      nplate: "",
      wbt_no: "",
      autodatetime: autodatetime,
      autoweighbridge: autoweighbridge,
      weighdate: autodatetime,
      autouser: autouser,
      ipaddress: getIPAddress(),
      anpr: anpr,
      anprb: anprb,
      autostatus: autostatus,
    });
    token = getToken();
    headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const res = axios
      .post(endpoint + "/autoweigh", json, headers)
      .then((resp) => {
        autoweighReturn = resp.data;
        var anprip =
          "http://192.168.4.11:80/ISAPI/Streaming/channels/1/picture&username=admin&password=Webuye234&folderpath=E:/kenloadimg/kenload/dashboard/imgs/";
        anprip =
          "http://192.168.5.12:5002/kenload/dashboard/getimg.php?string=http://192.168.4.57:80/jpg/image.jpg?size=3";

        if (scandeck == "A") {
          anprip =
            "http://192.168.4.11:80/ISAPI/Streaming/channels/1/picture&username=admin&password=Webuye234&folderpath=E:/kenloadimg/kenload/dashboard/imgs/";
        }
        if (scandeck == "D") {
          anprip =
            "http://192.168.4.12:80/ISAPI/Streaming/channels/1/picture&username=admin&password=Webuye234&folderpath=E:/kenloadimg/kenload/dashboard/imgs/";
        }
        var theUrlanpr =
          endpoint +
          "/UploadFile/GetANPR?url=" +
          anprip +
          dir +
          "&imageName=AUTOF" +
          stationc +
          autoweighReturn.id +
          ".jpg";
        const respanpr = axios
          .get(theUrlanpr, header)
          .then((anprres) => {
            console.log(anprres);
            console.log(anprres.data.processing_time_ms);
            try {
              anpr = anprres.data.results[0].candidates[0].plate + "";
            } catch (Exception) {
              anpr = "";
            }
            scananpr = anpr;
          })
          .catch((e) => {
            console.log(e);
          });
        var overviewip =
          "http://192.168.51.12:5002/kenload/dashboard/getimg.php?string=http://192.168.51.104:80/cgi-bin/viewer/video.jpg&dir=";
        overviewip =
          "http://192.168.5.12:5002/kenload/dashboard/getimg.php?string=http://192.168.5.52:80/jpg/image.jpg?size=3";

        if (scandeck == "A") {
          overviewip =
            "http://192.168.3.22:5002/kenload/dashboard/getimg.php?string=http://192.168.3.111:80/cgi-bin/viewer/video.jpg&dir=";
        }
        if (scandeck == "D") {
          overviewip =
            "http://192.168.3.22:5002/kenload/dashboard/getimg.php?string=http://192.168.3.110:80/cgi-bin/viewer/video.jpg&dir=";
        }
        var myUrloverview =
          overviewip +
          dir +
          "&filename=AUTOO" +
          stationc +
          autoweighReturn.id +
          ".jpg";
        axios
          .get(myUrloverview, headers)
          .then(() => {})
          .catch((e) => {
            console.log(e + myUrloverview);
          });

        if (scandeck != "") {
          if (scandeck == "D") {
            anprip =
              "http://192.168.3.101:80/ISAPI/Streaming/channels/1/picture&username=admin&password=Webuye234&folderpath=E:/kenloadimg/kenload/dashboard/imgs/";
          }
          if (scandeck == "A") {
            anprip =
              "http://192.168.3.100:80/ISAPI/Streaming/channels/1/picture&username=admin&password=Webuye234&folderpath=E:/kenloadimg/kenload/dashboard/imgs/";
          }
          var theUrlanpr3 =
            endpoint +
            "/UploadFile/GetANPR?url=" +
            anprip +
            dir +
            "&imageName=AUTOR" +
            stationc +
            autoweighReturn.id +
            ".jpg";
          axios
            .get(theUrlanpr3, headers)
            .then(() => {})
            .catch((e) => {
              console.log(e + theUrlanpr3);
            });
        }
      })
      .catch((e) => {
        console.log(e + "Post autoweigh");
      });
  }
  if (tot > 100 && prog == 0) {
    setrec();
    if (inserted == 0) {
      inserted = 1;
    }
    veharrive = 2;
    scalestatus = "Vehicle on Deck";
  }
}
function setrec() {
  prog = 0;
}
function getToken() {
  const json2 = JSON.stringify({
    email: "admin@admin.com",
    password: "@Admin123",
  });
  axios
    .post(endpoint + "/AuthManagement/Login", json2, headers)
    .then((resp) => {
      console.log(resp.data.token);
      return resp.data.token;
    })
    .catch((e) => {
      console.log(e + endpoint + "/api/AuthManagement/Login");
    });
}
function systemstarting() {
  var autodatetime = getcurrentdate();
  //var autoweighbridge = stationcode;
  var anpr = "-----------";
  var anprb = "----------";
  var autostatus = "S";
  var json = JSON.stringify({
    deck1: 88888,
    deck2: 88888,
    deck3: 88888,
    deck4: 88888,
    gvw: 0,
    nplate: "",
    wbt_no: "",
    autodatetime: autodatetime,
    autoweighbridge: stationcode,
    weighdate: autodatetime,
    autouser: autouser,
    ipaddress: getIPAddress(),
    anpr: anpr,
    anprb: anprb,
    autostatus: autostatus,
  });
  //const json = JSON.stringify({ answer: 42 });
  // console.log(json);
  token = getToken();
  headers = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  const res = axios
    .post(endpoint + "/autoweigh", json, headers)
    .then(() => {})
    .catch((e) => {
      console.log(e + "Posting Start autoweigh");
    });
}
systemstarting();
var dsp = null;
dsp = setInterval((err) => {
  if (err) throw err;
  console.log("scan " + scananpr);
  callseeweight();
}, 400);
app.post("/weights", cors(), (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  console.log("Got body:", req.body);
  weightaken = req.body.weightaken;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end("Done");
  veharrive = 5;
  //UPDATE AUTOWEIGH
  autoweighReturn.autostatus = "W";
  autoweighReturn.wbt_no = req.body.wbrg_ticket_no;
  autoweighReturn.weighdate = req.body.wbrg_ticket_dateout;
  autoweighReturn.nplate = req.body.nplate;
  //autoweighReturn.wbtno = req.body.Weighbridgetransactionsid;
  autoweighReturn.anpr = scananpr;
  veharrive = 5;
  token = getToken();
  var headers = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  axios
    .put(
      endpoint + "/autoweigh/" + autoweighReturn.id,
      autoweighReturn,
      headers,
    )
    .then((resp) => {
      console.log(resp.data);
    })
    .catch((e) => {
      console.log(e);
    });
});
app.post("/scan", cors(), (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  console.log("Got body:", req.body);
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
// Start the server
app.listen(portNumber, () => {
  console.log(`Server is running on http://localhost:${portNumber}`);
});
module.exports = {
  readings: readings,
};