const express = require('express');
const router = express.Router();
const Sighting = require('../model/Sighting');

router.get('/sighting-detail/:sightingId', async (req, res, next) => {
    try {
        const coo=req.cookies.username;
        const sightingId = req.params.sightingId;
        console.log(sightingId)
        const sighting = await Sighting.getSightingById(sightingId);
        if (sighting) {
            res.render('sightingDetail', { sighting:sighting,username:coo });
        } else {
            res.status(404).send('sighting not found');
        }
    } catch (error) {
        next(error);
    }
});

router.post('/updatedDescription', async (req, res) => {
    const { sightingId, newDescription } = req.body;
    console.log(sightingId)
    try {
        const updatedSighting = await Sighting.findByIdAndUpdate(sightingId, { Description: newDescription }, { new: true });
        if (updatedSighting) {
            res.status(200).json({ updatedDescription: updatedSighting.Description });
        } else {
            res.status(404).json({ error: 'Sighting not found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update description.' });
    }
});



module.exports = router;
