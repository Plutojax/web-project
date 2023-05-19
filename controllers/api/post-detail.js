/**
 * Fetch document from MongoDB by id and transfer into a json file.
 * */
const Sighting = require('../../model/Sighting');

const getPostRecords = async (req, res) => {
    try {
        const { postId } = req.body;
        const queryResult = await Sighting.findById(postId);
        console.log('post details');
        res.status(200).json(queryResult);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPostRecords };