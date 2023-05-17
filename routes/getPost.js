/**
 * The code creates a router object using the Express framework's Router method.
 * It imports the getAllPostsWithImagesAndIds function from the post-image-id-controller module.
 * This router is configured to handle GET requests to the root path and pass them to the getAllPostsWithImagesAndIds function.
 * */
const express = require('express');

const router = express.Router();
const { getAllPostsWithImagesAndIds } = require('../controllers/api/get_post');

router.get('/', getAllPostsWithImagesAndIds);

module.exports = router;
