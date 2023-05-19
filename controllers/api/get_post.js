/**
 * Fetch all sighting record details from MongoDB.
 * */
const Sighting = require('../../model/Sighting');

const getAllSightings = async (req, res) => {
    console.log('Reached inside getAllSightings in controllers/api');
    try {
        const posts = await Sighting.find({}, { image: 1, _id: 1,DateSeen:1,Identification:1 }).sort("DateSeen");
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllSightings };