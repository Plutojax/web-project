const express = require('express');
const router = express.Router();
const multer  = require('multer');
const path = require('path');
const Sighting = require('../model/Sighting');

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

// Set up multer upload configuration
const upload = multer({ storage: storage });

// Handle GET /upload route to render the upload form
router.get('/upload', (req, res) => {
    const coo=req.cookies.username;
    // const user = req.user;
    // if (!user) {
    //     // handle case where user is not logged in
    // }
    // res.render('upload', { user });
    res.render('upload',{username:coo});
});

// Handle POST /upload route to process form submission
router.post('/upload', upload.single('image'), (req, res) => {
    // Get form data from the request
    let { identification, description, dateSeen,username} = req.body;
    const image = req.file.path;
    // identification can be given later
    if (identification.toString().trim().length<=0)
    {
        identification = "NotGiven"
    }
    // Create a new food data object
    const sighting = new Sighting({
        image,
        Identification: identification,
        Description: description,
        DateSeen: dateSeen,
        username: username
    });
    console.log(sighting);
    // Save the new food data object to the database
    sighting.save()
        .then(() => {
            // Redirect to success page
            res.redirect('/success');
        })
        .catch((err) => {
            // Handle errors and show error page
            console.error(err);
            res.redirect('/error');
        });
});

router.get("/success", (req, res) => {

    res.render('success',);
});

module.exports = router;
