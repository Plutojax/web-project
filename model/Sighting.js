const mongoose = require('mongoose');

// define the sighting data model
/**
 * Sighting Schema
 *
 * This Mongoose schema represents a sighting of an object. It includes the following fields:
 * - `image`: The image URL of the sighting. It is a required field.
 * - `Identification`: The identification of the sighting. It is a required field.
 * - `Description`: The description of the sighting. It is a required field.
 * - `DateSeen`: The date when the sighting was observed. It is a required field.
 * - `location`: The location of the sighting. It is a required field.
 * - `latitude`: The latitude of the sighting location.
 * - `longitude`: The longitude of the sighting location.
 *
 * @name SightingSchema
 * @type {mongoose.Schema}
 */
const SightingSchema = new mongoose.Schema({
    image: { type: String, required: true },
    Identification: { type: String, required: true },
    Description: { type: String, required: true },
    DateSeen: { type: Date, required: true },
    location: {type:String, required: true},
    latitude: {type: Number},
    longitude: {type: Number}
}, { timestamps: true });


/**
 * Retrieve sighting by id from the database.
 *
 * This static method fetches the sighting with the provided ID from the database.
 *
 * @name getSightingById
 * @function
 * @async
 * @param {string} sightingId - The id of the sighting to retrieve.
 * @returns {object|null} - The sighting object or null if not found.
 * @throws {Error} Will throw an error if it failed to retrieve the sighting.
 */
SightingSchema.statics.getSightingById = async function (sightingId) {
    try {
        const sighting = await this.findById(sightingId);
        return sighting;
    } catch (error) {
        console.error('Error getting sighting by ID:', error);
        return null;
    }
};

// create sighting data model
/**
 * Sighting Model
 *
 * This Mongoose model is used to interact with the 'sightings' collection in the database.
 *
 * @name SightingModel
 * @type {mongoose.Model}
 */
const Sighting = mongoose.model('sightings', SightingSchema);

// export sighting data model
module.exports = Sighting;
