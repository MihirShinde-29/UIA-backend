const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    type: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    imageURL: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    latitude: {
        type: Number,
        required: true,
        trim: true,
        minlength: 3
    },
    longitude: {
        type: Number,
        required: true,
        trim: true,
        minlength: 3
    },
    address: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    date: {
        type: Date,
        required: true,
        trim: true,
        minlength: 3
    },
    image: {
        data: Buffer,
        contentType: String,
    }
}, {
    timestamps: true,
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
