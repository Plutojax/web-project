const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    user_id: { type: String, required: true },
    token: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Session', sessionSchema);
