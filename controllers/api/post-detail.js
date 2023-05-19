/**
 * An asynchronous function that fetch document from MongoDB by id and transfer into a json file.
 *  It returns the data as JSON, or sends a 500 response with an error message if there's an issue.
 *  *
 *  * @function
 *  * @async
 *  * @param {object} req - The express request object, which should include a body with 'postId' property.
 *  * @param {object} res - The express response object.
 *  * @returns {object} res - The express response object. Sends a 200 status code and a JSON object containing the post details, or a 500 status code and a JSON object with an error message.
 *  * @throws {Error} Will throw an error if there's an issue with the database retrieval.
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