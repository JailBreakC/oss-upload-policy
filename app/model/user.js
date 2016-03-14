var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    nickname: String,
    avator: String,
    sign: String,
    role: String,
    deleted: {
        type: Boolean,
        required: true,
        default: false,
    }
    createdAt: { type: Date, default: Date.now },
    modifidAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('user',releaseSchema);