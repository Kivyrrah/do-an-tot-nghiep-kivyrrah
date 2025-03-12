const express = require("express");
const router = express.Router();
const Favorite = require("../models/FavoriteSchema"); 
const Song = require("../models/SongSchema"); 

router.get("/playlists-show", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send("Email là bắt buộc");
  }

  try {
    const playlists = await Favorite.find({ email }).populate("songs").exec();

    if (!playlists) {
      return res.status(404).send("Không tìm thấy playlist nào");
    }

    res.status(200).json(playlists);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách playlist:", error);
    res.status(500).send("Lỗi hệ thống");
  }
});

router.get("/playlists", async (req, res) => {
  const { email } = req.query;

  try {
    const playlists = await Favorite.find({ email });
    if (playlists.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy playlist nào" });
    }

    res.status(200).json(playlists);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách playlist:", error);
    res.status(500).json({ message: "Lỗi hệ thống, vui lòng thử lại sau" });
  }
});

router.post("/playlists/add", async (req, res) => {
  const { email, songId, playlistName } = req.body;

  if (!email || !songId || !playlistName) {
    return res.status(400).send("email, songId và tên playlist là bắt buộc");
  }

  try {
    let playlist = await Favorite.findOne({ email, name: playlistName });

    if (!playlist) {
      playlist = new Favorite({ email, name: playlistName, songs: [] });
    }

    if (!Array.isArray(playlist.songs)) {
      playlist.songs = [];
    }

    if (playlist.songs.includes(songId)) {
      return res.status(400).send("Bài hát đã có trong playlist");
    }

    playlist.songs.push(songId);
    await playlist.save();

    res.status(200).send("Đã thêm bài hát vào playlist");
  } catch (error) {
    console.error("Lỗi khi thêm bài hát vào playlist:", error);
    res.status(500).send("Lỗi hệ thống");
  }
});

router.delete("/playlists/:playlistId/song/:songId", async (req, res) => {
  const { playlistId, songId } = req.params;

  try {
    const playlist = await Favorite.findById(playlistId);
    
    if (!playlist) {
      return res.status(404).send("Playlist không tồn tại");
    }

    playlist.songs = playlist.songs.filter(song => song.toString() !== songId);

    await playlist.save();

    res.status(200).json(playlist);
  } catch (error) {
    console.error("Lỗi khi xóa bài hát khỏi playlist:", error);
    res.status(500).send("Lỗi hệ thống");
  }
});

router.delete("/playlists/:playlistId", async (req, res) => {
  const { playlistId } = req.params;

  try {
    const playlist = await Favorite.findByIdAndDelete(playlistId);

    if (!playlist) {
      return res.status(404).send("Playlist không tồn tại");
    }

    res.status(200).send("Playlist đã được xóa");
  } catch (error) {
    console.error("Lỗi khi xóa playlist:", error);
    res.status(500).send("Lỗi hệ thống");
  }
});
  
module.exports = router;
