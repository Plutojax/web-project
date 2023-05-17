/**
 * Retrieves the details of a post specified by the postId and sends it as a response in JSON format.
 * */
const Sighting = require('../../model/Sighting');

const getPostDetails = async (req, res) => {
    try {
        const { postId } = req.body;
        const postDetails = await Sighting.findById(postId);
        console.log('post details');
        res.status(200).json(postDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPostDetails };