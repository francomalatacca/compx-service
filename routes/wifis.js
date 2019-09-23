var express = require('express');
var router = express.Router();


/* GET wifi listing. */
router.get('/', function(req, res, next) {
  const coordinatesRegex = /^(\-?\d+(\.\d+)?),*(\-?\d+(\.\d+)?)$/;
  const coordinates = req.query.coordinates;
 
  const latitude = coordinatesRegex.test(coordinates) ? coordinates.split(',')[0]: req.query.latitude;
  const longitude = coordinatesRegex.test(coordinates) ? coordinates.split(',')[1] : req.query.longitude;
  
  const near = {
    location:
      { $near :
         {
           $geometry: { type: "Point",  coordinates: [ longitude, latitude ] },
           $minDistance: 1000,
           $maxDistance: 5000
         }
      }
  }
  const MongoClient = require('mongodb').MongoClient;
  const uri = "mongodb+srv://svc:@cluster0-yajuq.mongodb.net/test?retryWrites=true&w=majority";
  const client = new MongoClient(uri, { useNewUrlParser: true });

  client.connect(err => {
    const collection = client.db("test").collection("devices");
    //"latitude": latitude, "longitude": longitude
    const wifisCursor = collection.find({"latitude": Number.parseFloat(latitude), "longitude": Number.parseFloat(longitude)}).toArray((err, docs) => {
      if(docs){

        res.send(docs);
      }else{
        res.send([]);
      }
 });
});
    return
});

router.post("/", function(req, res, next) {
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  const altitude = req.body.altitude;
  const speed = req.body.speed;
  const satellites = req.body.satellites;
  const ssid = req.body.ssid;
  const rssi = req.body.rssi;
  const channel = req.body.channel;
  const bssid = req.body.bssid;
  const encryptionType = req.body.encryptionType;
  const acquiredTime = req.body.acquiredTime;

  if(ssid.indexOf("_nomap") > -1) {
    res.status(400).send({"message": "SSID contains _nomap"});
  }

  // TIM-92099820,-92,1,3C:98:72:5B:C8:8B,WPA2,2019-9-8T19:24:53.0Z,41.071060,16.982876,78.20,160.35,0.76,7

  const wifi = {
    "ssid": ssid,
    "rssi": Number.parseFloat(rssi),
    "bssid": bssid,
    "channel": Number.parseInt(channel),
    "encryptionType": encryptionType,
    "acquiredTime": new Date(acquiredTime),
    "latitude": Number.parseFloat(latitude),
    "longitude": Number.parseFloat(longitude),
    "altitude": Number.parseFloat(altitude),
    "speed": Number.parseFloat(speed),
    "satellites": Number.parseInt(satellites),
    "createdAt": new Date()
  }
  const MongoClient = require('mongodb').MongoClient;
  const uri = "mongodb+srv://svc:@cluster0-yajuq.mongodb.net/test?retryWrites=true&w=majority";
  const client = new MongoClient(uri, { useNewUrlParser: true });

  client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    collection.insertOne(wifi);
    client.close();
    res.send(201);
  });
});

module.exports = router;
