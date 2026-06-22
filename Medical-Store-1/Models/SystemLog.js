const mongoose = require('mongoose');

const SystemLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    details: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SystemLog', SystemLogSchema);