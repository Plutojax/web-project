/**
 * This code defines a router for handling HTTP POST requests to a specific endpoint.
 * The router is created using the Express.js framework's Router method, and then a POST route is defined on this router using the .post() method.
 * The insertSightingPost function from a sighting-post-controller module is specified as the handler for this route.
 * */
const express = require('express');

const router = express.Router();
const { insertSightingPost } = require('../controllers/api/insert_form_controller');

router.post('/', insertSightingPost);
module.exports = router;
