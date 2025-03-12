const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema(
  {
    email: [
      {
        type: String,
        ref: "User", 
        required: true,
      },
    ],
    name: {
      type: String,
      required: true,
    },
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SongSchema",
      }
    ]
  },
  {
    timestamps: true 
  }
);

module.exports = mongoose.model("Favorite", FavoriteSchema);
