/**
 * Controller function for inserting a sighting into MongoDB.
 */
const SightingPost = require('../../model/Sighting');

const insertSightingRow = (req, res) => {
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

module.exports = { insertSightingRow };
