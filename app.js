const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const fetch = require('isomorphic-fetch');
// Connect to the MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/Sighting', {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.Promise = global.Promise;


// import express.json() middleware
app.use(express.json());
// set 'public' as a static folder
app.use(express.static('public'));

// Set up middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
//check session


// Set the view engine and views directory
app.set('view engine', 'ejs');
app.set('views', './views');

const insertrouter = require('./routes/insert');
const fetchPostsWithImageIdRouter = require('./routes/getPost');
const sightingDetail=require('./routes/getDetail');
// Set up the controllers
const homeController = require('./controllers/homeController');
const detailController = require('./controllers/detailController');
const uploadController = require('./controllers/uploadController');

const path = require("path");
app.use(express.static(path.join(__dirname, '')));
app.use('/insert-post', insertrouter);
app.use('/get-posts', fetchPostsWithImageIdRouter);
app.use('/sighting-detail',sightingDetail);

app.use(homeController);
app.use(uploadController);
app.use(detailController);


// Export the app instance
module.exports = app;
