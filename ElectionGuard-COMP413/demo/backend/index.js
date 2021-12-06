const express = require('express');
const cors = require('cors');
const fs = require('fs');
const url = require('url');
const path = require('path');
const https = require('https');

const CONFIG = require('@electionguard-comp413/config');
let key = fs.readFileSync(path.join(__dirname, '../sslcert/selfsignedserver.key'));
let cert = fs.readFileSync(path.join(__dirname, '../sslcert/selfsignedserver.crt'));
let options = {
  key: key,
  cert: cert
};

const app = express();
app.use(cors());
// TODO: Write API

//host voter main interface
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

// let server = https.createServer(options, app);
//load static files
console.log(__dirname);
console.log(path.join(__dirname, '../../'));
app.use(express.static(path.join(__dirname, '../../')));

//receive voter's encrypted ballot & manifests
app.post('/receive/:voterId', function(req, res) {
  let body = '';
  let voterId = req.params.voterId;
  console.log("receive: "+voterId);
  let filePath = path.join(__dirname, '../../../encrypted_data/000/receivedCipherTextBallot_'+voterId+'.txt');
  console.log(filePath);
  req.on('data', function(data) {
    body += data;
  });
  console.log("30");
  req.on('end', function (){
    console.log("32");
    fs.appendFile(filePath, body, function() {
      res.end();
    });
  });
});

// app.use(express.static(path.join(__dirname, '../frontend/build')));

// app.use('/public', express.static(__dirname + '/public'));
// app.use(express.static(__dirname + '/public'));
app.listen(CONFIG.PORT, () => {
  // let host = server.address().address;
  // let port = server.address().port;
  // console.log('running at http://' + host + ':' + port);
  console.log(`Listening on ${CONFIG.PORT}`);
});
// server.listen(CONFIG.PORT, () => {
//   // let host = server.address().address;
//   // let port = server.address().port;
//   // console.log('running at http://' + host + ':' + port);
//   console.log(`Listening on ${CONFIG.PORT}`);
// });
