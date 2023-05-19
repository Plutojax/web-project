const express = require('express');
const router = express.Router();




/**
 * Route serving the upload form page of the application.
 *
 * The function handles GET requests to the '/upload' URL.
 * It renders the upload page view.
 *
 * @name get/upload
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/upload', (req, res) => {
    // const user = req.user;
    // if (!user) {
    //     // handle case where user is not logged in
    // }
    // res.render('upload', { user });
    res.render('upload');
});

// Handle POST /upload route to process form submission
/**
 * Route serving the success page of the application.
 *
 * The function handles GET requests to the '/success' URL.
 * It renders the success page view.
 *
 * @name get/success
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get("/success", (req, res) => {

    res.render('success',);
});

module.exports = router;
