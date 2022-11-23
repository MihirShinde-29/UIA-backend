const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    }
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
