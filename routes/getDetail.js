/**
 * This code creates an Express router that listens for POST requests on the root route, and calls the getPostDetails function from the post-details-controller module.
 * The router is then exported for use in the main Express app.
 * */
const express = require('express');

const router = express.Router();
const { getPostDetails } = require('../controllers/api/post-detail');

router.post('/', getPostDetails);

module.exports = router;
