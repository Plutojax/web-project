const express = require('express');
const router = express.Router();
const Sighting = require('../model/Sighting');

// Render the homepage

router.get('/', async(req, res) => {
    // Get all sighting data from the database
    Sighting.find({})
        .then((sightings) => {
            res.render('home');
        })
        .catch((err) => {
            // Handle errors and show error page
            console.error(err);
            res.redirect('/error');
        });
});

module.exports = router;
