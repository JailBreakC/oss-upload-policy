var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    first: String,
    sec: String,
    author: String,
    deleted: {
        type: Boolean,
        required: true,
        default: false,
    },  
    ip : String,
    message : String,
    weither : String,
    loc : String,
    weither_icon : String,
    img : String,
    city: String,
    createdAt:  { type: Date, default: Date.now },
    deletedAt:  { type: Date, default: Date.now }
});

messageSchema.static('safeFind', function (params, callback) {
    var _this = this;
    this.count({ deleted: false }, function(err, count) {
        return _this.find({ deleted: false }).sort({'createdAt':-1}).skip((params.page - 1) * params.count).limit(params.count).exec(function(err, result) {
            callback(err, result, count);   
        });
    });
});

module.exports = mongoose.model('message', messageSchema);