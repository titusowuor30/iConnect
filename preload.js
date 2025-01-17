const axios = require("axios");

const SerialPort = require("serialport").SerialPort;
const indicator = "ZM";
const { ReadlineParser } = require("@serialport/parser-readline");
var net = require("net");
const fs = require("fs");
const cors = require("cors");
var express = require("express");
var app = express();
const bodyParser = require("body-parser");
var scananpr = "";
var st = "Z1G 2        00kg";
console.log("eee" + st.substring(4, 5));
// Middleware to parse JSON bodies
app.use(bodyParser.json({ type: "*/*",limit: '100mb' })); 
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
var server = "localhost";
var serverport = 44365;
var weightaken = 0;
var scanned = 0;
var scan = 0;
var veharrive = 0;
var inserted = 0;
var prog = 0;
var bidirectional = false;
var scandeck = "";
var endpoint = "http://localhost:44365/api";
var anprbody={"plate":""};

var dec1 = 0;
var dec2 = 0;
var dec3 = 0;
var dec4 = 0;

//var stationcode2 = "NRBKA";
var stationcode = "KNRBA";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var autoweighReturn = JSON.stringify({});
var shortAlarm = 15;
var longAlarm = 16;
var autouser = "KenloadV2";
var token = "";
let portName = "COM1";
let baudrate = 9600;
var runsend = "";
var readings = "  8000 kg, 10500 kg, 0 kg,  0 kg,";


var headers = {
  headers: {
    "Content-Type": "application/json",
  },
};
var scalestatus = "";
const udp = require("dgram");
const { Console } = require("console");
const client = udp.createSocket("udp4");
client.bind(13805, () => {
  console.log("UDP server listening on 192.168.8.16:13805");
});//buffer msg
const data = Buffer.from("#01\r");
console.log("udp data===>>"+data)
client.on("message", (msg, info) => {
  var str = "";
  var va = 0;
  console.log("udp data===>>"+msg+"====>info===>"+info)
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
  sendtoRDU(readings);
  //console.log("Data received from server : " + msg.slice(24,msg.length).toString());
  console.log(
    "Received %d bytes from %s:%d\n",
    msg.length,
    info.address,
    info.port,
  );
});
console.log("stationcode:" + stationcode);

//////TCP/////
// Create a TCP client
const tcpclient = new net.Socket();
// Connect to the server
tcpclient.connect(13805, "192.168.8.16", () => {
    console.log("Connected to server");
    // Send data to the server
    const data = Buffer.from("#01\r");
    console.log("Sending data: " + data.toString());
    tcpclient.write(data);
});

// Handle incoming TCP data
tcpclient.on("data", (data) => {
  const response = data.toString().trim();
  console.log("Raw response from server: " + response);

  const weights = response.match(/(\d+)\s*kg/g);
  if (weights) {
      const formattedWeights = weights.map(weight => weight.trim());
      while (formattedWeights.length < 4) {
          formattedWeights.push("0 kg");
      }
      readings = formattedWeights.slice(0, 4).join(", ") + ", ";
  } else {
      readings = "0 kg, 0 kg, 0 kg, 0 kg, ";
  }

  console.log("Formatted readings: " + readings);
});

// Handle client errors
tcpclient.on("error", (err) => {
    console.error(`Error: ${err.message}`);
});

// Handle client close
tcpclient.on("close", () => {
    console.log("Connection closed");
});

console.log(portName);
const myPort = new SerialPort({
  path: portName,
  baudRate: baudrate,
});

const parser = myPort.pipe(new ReadlineParser({ delimiter: "\r" }));
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
//soundalarm(longAlarm);
function readSerialData(data) {
  var reads = data;
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
    sendtoRDU(reads);
  }
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
    sendtoRDU(reads);
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
  if (indicator != "Cardinal" && indicator != "Cardinal2" && indicator != "ZM" ) {
    readings = data + ",";
    RDU.readings = data + ",";
    module.exports.readings = data + ",";
    reads = data + ",";
    sendtoRDU(reads);
  }
}
function sendtoRDU(reads) {
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

  //const msec = d.getMilliseconds();
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
  // player.play(audioFile, (err) => {
  //   if (err) {
  //     console.error("Error playing audio:", err);
  //   }
  // });
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
      .then((resp) => {
        //console.log(resp.data[0]);
        autoweighReturn = resp.data;
        var anprip =
          "http://192.168.8.10:80/ISAPI/Streaming/channels/1/picture&username=admin&password=Kanyonyo2025&folderpath=E:/kenloadimg/kenload/dashboard/imgs/";
        //var JURUA ="http://192.168.51.101:80/ISAPI/Streaming/channels/2/picture&username=admin&password=ROOT12345&folderpath=E:/kenloadimg/kenload/dashboard/imgs/";
        if (scandeck == "A") {
          anprip =
            "http://192.168.8.10:80/ISAPI/Streaming/channels/1/picture&username=admin&password=Kanyonyo2025&folderpath=E:/kenloadimg/kenload/dashboard/imgs/";
        }
        if (scandeck == "D") {
          anprip =
            "http://192.168.8.11:80/ISAPI/Streaming/channels/1/picture&username=admin&password=Kanyonyo2025&folderpath=E:/kenloadimg/kenload/dashboard/imgs/";
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

        // console.log("theUrlanpr - " + theUrlanpr);

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
        /////////////////////////////////////////
        // var myUrl =
        //   endpoint +
        //   "/UploadFile/CaptureImage?url=" +
        //   "http://192.168.51.101:80/ISAPI/Streaming/channels/2/picture&username=admin&password=ROOT12345&folderpath=E:/kenloadimg/kenload/dashboard/imgs/" +
        //   dir +
        //   "&imageName=AUTOF" +
        //   stationcode +
        //   autoweighReturn.id +
        //   ".jpg&username=admin&password=ROOT12345";

        // axios
        //   .get(myUrl, headers)
        //   .then(() => {})
        //   .catch((e) => {
        //     console.log(e + myUrl);
        //   });
        /////////////////////////////////////////
        // var JURUAoverviewip =
        // "http://192.168.51.12:5002/kenload/dashboard/getimg.php?string=http://192.168.51.104:80/cgi-bin/viewer/video.jpg&dir=";

        var overviewip =
          "http://192.168.8.12:5002/kenload/dashboard/getimg.php?string=http://192.168.8.13:80/ISAPI/Streaming/channels/1/picture&username=admin&password=Kanyonyo2025&folderpath=E:/kenloadimg/kenload/dashboard/imgs/";
        //var JURUA ="http://192.168.51.101:80/ISAPI/Streaming/channels/2/picture&username=admin&password=ROOT12345&folderpath=E:/kenloadimg/kenload/dashboard/imgs/";
        if (scandeck == "A") {
          overviewip =
            "http://192.168.8.12:5002/kenload/dashboard/getimg.php?string=http://192.168.8.13:80/ISAPI/Streaming/channels/1/picture&username=admin&password=Kanyonyo2025&folderpath=E:/kenloadimg/kenload/dashboard/imgs/";
        }
        if (scandeck == "D") {
          overviewip =
            "http://192.168.8.12:5002/kenload/dashboard/getimg.php?string=http://192.168.8.13:80/ISAPI/Streaming/channels/1/picture&username=admin&password=Kanyonyo2025&folderpath=E:/kenloadimg/kenload/dashboard/imgs/";
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
              "http://192.168.8.11:80/ISAPI/Streaming/channels/2/picture&username=admin&password=Kanyonyo2025&folderpath=E:/kenloadimg/kenload/dashboard/imgs/";
          }
          if (scandeck == "A") {
            anprip =
              "http://192.168.8.10:80/ISAPI/Streaming/channels/2/picture&username=admin&password=Kanyonyo2025&folderpath=E:/kenloadimg/kenload/dashboard/imgs/";
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
  //console.log(readings);
  //var at = getcurrentdate();
  console.log("scan " + scananpr);
  callseeweight();
}, 400);
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
  veharrive = 5;
  //UPDATE AUTOWEIGH
  autoweighReturn.autostatus = "W";
  autoweighReturn.wbt_no = req.body.wbrg_ticket_no;
  autoweighReturn.weighdate = req.body.wbrg_ticket_dateout;
  autoweighReturn.nplate = req.body.nplate;
  //autoweighReturn.wbtno = req.body.Weighbridgetransactionsid;
  autoweighReturn.anpr = scananpr;
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

// Endpoint for KeepAlive
app.post('/NotificationInfo/KeepAlive', (req, res) => {
    const { Active, DeviceID } = req.body;
    // Log the received data
    console.log('KeepAlive Data:', { Active, DeviceID });
    // Send a response
    res.status(200).json({ message: 'KeepAlive received', Active, DeviceID });
});

// Endpoint for TollgateInfo
app.post('/NotificationInfo/TollgateInfo', (req, res) => {
  const { Picture } = req.body; // Access the Picture object directly
  //console.log('TollgateInfo Data:', Picture);
  const plate = Picture?.Plate?.PlateNumber || ""; // Use optional chaining to safely access PlateNumber
  if (plate) {
      anprbody = { "plate": plate };
  }
  // Log the received data
  console.log('TollgateInfo Data:', plate);
  // Send a response
  res.status(200).json({ message: 'TollgateInfo received', data: anprbody });
});

app.get("/anpr", cors(), function (req, res) {
  // Webdriver test case code
  res.set("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.send(anprbody);
  anprbody={"plate":""}
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
  readings: readings,
};
