/**
 * An asynchronous function that fetch all sighting record details from MongoDB.
 * It returns the data as JSON, or sends a 500 response with an error message if there's an issue.
 *  * @function
 *  * @async
 *  * @module Sighting
 *  * @param {object} req - The express request object.
 *  * @param {object} res - The express response object.
 *  * @returns {object} res - The express response object. Sends a 200 status code and a JSON object containing the posts, or a 500 status code and a JSON object with an error message.
 *  * @throws {Error} Will throw an error if there's an issue with the database retrieval.
 * */
const Sighting = require('../../model/Sighting');

const getAllSightings = async (req, res) => {
    console.log('Reached inside getAllSightings in controllers/api');
    try {
        const posts = await Sighting.find({}, { image: 1, _id: 1,DateSeen:1,Identification:1,Description:1,location:1 }).sort("DateSeen");
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllSightings };