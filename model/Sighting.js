const mongoose = require('mongoose');

// define the sighting data model
const SightingSchema = new mongoose.Schema({
    image: { type: String, required: true },
    Identification: { type: String, required: true },
    Description: { type: String, required: true },
    DateSeen: { type: Date, required: true },
    location: {type:String, required: true},
    latitude: {type: Number},
    longitude: {type: Number}
}, { timestamps: true });
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
const Sighting = mongoose.model('sightings', SightingSchema);

// export sighting data model
module.exports = Sighting;
