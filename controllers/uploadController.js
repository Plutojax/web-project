const express = require('express');
const router = express.Router();




// Handle GET /upload route to render the upload form
router.get('/upload', (req, res) => {
    // const user = req.user;
    // if (!user) {
    //     // handle case where user is not logged in
    // }
    // res.render('upload', { user });
    res.render('upload');
});

// Handle POST /upload route to process form submission

router.get("/success", (req, res) => {

    res.render('success',);
});

module.exports = router;
