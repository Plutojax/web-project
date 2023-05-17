/**
 * Retrieves all sighting posts with images and IDs from the database.
 * */
const Sighting = require('../../model/Sighting');

const getAllPostsWithImagesAndIds = async (req, res) => {
    console.log('Reached inside fetch posts');
    try {
        const posts = await Sighting.find({}, { image: 1, _id: 1,DateSeen:1,Identification:1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllPostsWithImagesAndIds };