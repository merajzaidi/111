const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    tshirtType: { type: Array },
    fabric: { type: Array },
}, { timestamps: true });

module.exports = Setting = mongoose.model('Setting', SettingSchema);
