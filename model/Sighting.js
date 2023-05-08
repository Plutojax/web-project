const mongoose = require('mongoose');

// 定义食品数据的模式
const SightingSchema = new mongoose.Schema({
    image: { type: String, required: true },
    Identification: { type: String, required: true },
    Description: { type: String, required: true },
    DateSeen: { type: Date, required: true },
    username: { type: String, required: true }
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


// 创建食品数据模型
const Sighting = mongoose.model('sightings', SightingSchema);

// 导出食品数据模型
module.exports = Sighting;
