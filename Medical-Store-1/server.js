const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const Medicine = require('./models/Medicine');
const SystemLog = require('./models/SystemLog');

// Connect Database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medical_store_pro')
    .then(() => console.log('MongoDB Engine Online'))
    .catch(err => console.error('Database connection error:', err));

// --- API LAYERS ---

// Get all medicines
app.get('/api/medicines', async (req, res) => {
    try {
        const medicines = await Medicine.find();
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new medicine
app.post('/api/medicines', async (req, res) => {
    try {
        const item = new Medicine(req.body);
        await item.save();

        const log = new SystemLog({
            action: "Inventory Create",
            details: `Registered ${item.name} (${item.sku}) to database.`
        });
        await log.save();

        res.status(201).json({ success: true, message: "Medicine saved perfectly." });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a medicine
app.delete('/api/medicines/:id', async (req, res) => {
    try {
        const item = await Medicine.findByIdAndDelete(req.params.id);
        if (item) {
            const log = new SystemLog({
                action: "Inventory Delete",
                details: `Removed item ${item.name} from the cluster database.`
            });
            await log.save();
        }
        res.json({ success: true, message: "Item removed from database memory." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get global metrics summary for admin dashboard counters
app.get('/api/dashboard-summary', async (req, res) => {
    try {
        const totalItems = await Medicine.countDocuments();
        const lowStockItems = await Medicine.countDocuments({ stock: { $lt: 20 } });
        const outOfStockItems = await Medicine.countDocuments({ stock: 0 });
        
        res.json({
            totalItems,
            lowStockItems,
            outOfStockItems
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CLIENT ROUTING FALLBACKS ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('*', (req, res) => res.redirect('/'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));