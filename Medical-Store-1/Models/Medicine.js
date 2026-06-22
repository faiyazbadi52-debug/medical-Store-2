const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    genericName: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    status: { type: String, default: "In Stock" }
});

module.exports = mongoose.model('Medicine', MedicineSchema);