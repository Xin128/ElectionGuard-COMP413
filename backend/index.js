const express = require('express');
const path = require('path');
const CONFIG = require('@electionguard-comp413/config');

const app = express();

// TODO: Write API

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// app.use(express.static(path.join(__dirname, '../dist/esbuild')));
console.log(__dirname);
console.log(path.join(__dirname, '../'));
app.use(express.static(path.join(__dirname, '../')));

app.listen(CONFIG.PORT, () => console.log(`Listening on ${CONFIG.PORT}`));
