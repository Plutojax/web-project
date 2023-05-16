const express = require('express');
const session = require('express-session');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const Sighting = require('./model/Sighting');
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
app.use(function(req, res, next) {
    // Check if user is authenticated
    if (req.session.user) {
        res.locals.user = req.session.user;
    }
    next();
});

// Set the view engine and views directory
app.set('view engine', 'ejs');
app.set('views', './views');


// Set up the controllers
const authController = require('./controllers/authController');
const homeController = require('./controllers/homeController');
const detailController = require('./controllers/detailController');
const uploadController = require('./controllers/uploadController');
const path = require("path");
app.use(express.static(path.join(__dirname, '')));
app.use(authController);
app.use(homeController);
app.use(uploadController);
app.use(detailController);




// Export the app instance
module.exports = app;
