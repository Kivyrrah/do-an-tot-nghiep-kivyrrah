const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        required: true,
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "songs" }],
    isAdmin: {
        type: Boolean,
        default: false, 
    }
}, { collection: "user" });

module.exports = mongoose.model('User', UserSchema);
