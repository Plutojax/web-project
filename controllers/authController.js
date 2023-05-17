const express = require('express');
const app = express();
const router = express.Router();


// Render the login page
router.get('/', (req, res) => {
    res.render('login');
});

router.get('/login', (req, res) => {
    res.render('login');
});

// Handle the login form submission
router.post('/login', async (req, res) => {
    const { usernameOrEmail} = req.body;
    try {
        // Set the token as a cookie and redirect to the homepage
        res.cookie('username', usernameOrEmail)
        res.status(200).send(); // Send a 200 OK status for successful login
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server_error' });
    }
});

router.get('/logout', (req, res) => {
    res.render('login');
});

module.exports = router;
