const express = require('express');
const router = express.Router();
const Sighting = require('../model/Sighting');

/**
 * Route serving the home page of the application.
 *
 * The function handles GET requests to the root URL ('/'). It retrieves
 * all the sighting records from the database, then renders the home page view.
 * If an error occurs while retrieving the sightings, the user is redirected
 * to an error page.
 *
 * @name get/
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
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
