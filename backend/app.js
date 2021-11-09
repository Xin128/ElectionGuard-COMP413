import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import routes from './routes/index.js';
import path from "path";

const app = express();

/**
 * Connect to the database
 */

mongoose.connect('mongodb://localhost');

/**
 * Middleware
 */

//load html page
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../index.html'));
});

//load static files
console.log(__dirname);
console.log(path.join(__dirname, '../'));
app.use(express.static(path.join(__dirname, '../')));

//parse jsons
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// catch 400
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(400).send(`Error: ${res.originUrl} not found`);
  next();
});

// catch 500
app.use((err, req, res, next) => {
  console.log(err.stack)
  res.status(500).send(`Error: ${err}`);
  next();
});

/**
 * Register the routes
 */

routes(app);

export default app;
