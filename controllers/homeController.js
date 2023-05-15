const express = require('express');
const router = express.Router();
const Sighting = require('../model/Sighting');

// Render the homepage

router.get('/home', async(req, res) => {
    const coo=req.cookies.username;
    // Get all sighting data from the database
    Sighting.find({})
        .then((sightings) => {
            // console.log("DATA SIGHTINGS",sightings)
            // sightings.sort(function(a, b){return b.DateSeen - a.DateSeen });
            res.render('home', { sightings:sightings,username:coo });
        })
        .catch((err) => {
            // Handle errors and show error page
            console.error(err);
            res.redirect('/error');
        });
});

module.exports = router;
