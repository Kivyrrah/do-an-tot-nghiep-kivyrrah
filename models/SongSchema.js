const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: String,
    artist: String,
    url: {
        type: String,
        unique: true
    },
    coverImage: { 
        type: String,
    },
    genre: String,
    playCount: { type: Number, default: 0 },
}, {collection: "songs"});

module.exports = mongoose.model('SongSchema', songSchema);