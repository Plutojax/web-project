/**
 * Imports the getAllSightings function from the get_post module.
 * Handle GET requests to the root path and pass them to the getAllSightings function in controllers.
 * */
const express = require('express');

const router = express.Router();
const { getAllSightings } = require('../controllers/api/get_post');

router.get('/', getAllSightings);

module.exports = router;
