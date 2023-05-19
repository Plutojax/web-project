/**
 * Controller function for inserting a sighting into MongoDB.
 * @function
 *  * @param {object} req - The express request object, which should include an object body with properties for 'image', 'Identification', 'Description', 'DateSeen', 'location', 'latitude', and 'longitude'.
 *  * @param {object} res - The express response object.
 *  * @throws {Error} Will redirect to an '/error' route if there's an issue with saving the post.
 *  * @returns {object} res - The express response object. Redirects to a '/success' route after successfully saving the post.
 */
const SightingPost = require('../../model/Sighting');

const UploadSighting = (req, res) => {
    console.log('Reaching insertSightingRow in controllers/api');
    console.log("req",req.body);
    const {
        image, Identification,Description, DateSeen,location,latitude,longitude
    } = req.body;
    const SightingPostObject = new SightingPost({
        image,
        Identification: Identification,
        Description: Description,
        DateSeen: DateSeen,
        location: location,
        latitude: latitude,
        longitude:longitude
    });
    SightingPostObject.save()
        .then(() => {
            // Redirect to success page
            res.redirect('/success');
        })
        .catch((err) => {
            // Handle errors and show error page
            console.error(err);
            res.redirect('/error');
        });
};

module.exports = {UploadSighting};
