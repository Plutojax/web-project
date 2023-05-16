/**
 * Controller function for inserting a sighting post into the database.
 */
const SightingPost = require('../../model/sighting');

const insertSightingPost = (req, res) => {
    console.log('Reaching till controller');
    const {
        image, identification,description, dateSeen, username,location,latitude,longitude
    } = req.body;
    const SightingPostObject = new SightingPost({
        image,
        Identification: identification,
        Description: description,
        DateSeen: dateSeen,
        username: username,
        location: location,
        latitude: latitude,
        longitude:longitude
    });
    sighting.save()
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

module.exports = { insertSightingPost };
