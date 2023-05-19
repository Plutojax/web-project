/**
 * Creates an Express router that listens for POST requests on the root route
 * Calls the getPostRecords function from the post-details in controller module.
 * */
const express = require('express');

const router = express.Router();
const { getPostRecords } = require('../controllers/api/post-detail');

router.post('/', getPostRecords);

module.exports = router;
