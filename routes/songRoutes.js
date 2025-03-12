const express = require('express');
const SongSchema = require('../models/SongSchema');
const router = express.Router();

router.get('/songlist', async (req, res) => {
    try {
        const song = await SongSchema.find();
        res.json(song);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message:   
 'Server error' });
    }
});

router.get('/related', async (req, res) => {
  const { genre, limit } = req.query; 
    try {
        const filter = genre ? { genre } : {}; 
        const songs = await SongSchema.aggregate([
            { $match: filter }, 
            { $sample: { size: Number(limit) || 10 } },
        ]);

        res.json(songs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/artist', async (req, res) => {
    const { artist, limit } = req.query; 
      try {
          const filter = artist ? { artist } : {}; 
          const songs = await SongSchema.aggregate([
              { $match: filter },
              { $sample: { size: await SongSchema.countDocuments(filter) } }, 
          ]);
  
          res.json(songs);
      } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Server error' });
      }
  });

router.get('/songcount', async (req, res) => {
    try {
      const songCount = await SongSchema.countDocuments();  
      res.json({ count: songCount });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

router.put('/:id/play', async (req, res) => {
  try {
        const songId = req.params.id;
        const song = await SongSchema.findById(songId);

        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }

        song.playCount += 1;
        await song.save();

        res.json({ message: 'Play count updated', playCount: song.playCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/top-songs', async (req, res) => {
  try {
      const topSongs = await SongSchema.find().sort({ playCount: -1 }).limit(10);
      res.json(topSongs);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
  }
});

router.post('/postsong', async (req, res) => {
    const { title, artist, url, coverImage, genre } = req.body;

    if (!title || !artist || !url) {
        return res.status(400).json({ message: 'Các trường title, artist, và songUrl là bắt buộc.' });
    }

    try {
        const existingSong = await SongSchema.findOne({ url });
        if (existingSong) {
            return res.status(400).json({ message: 'Bài hát với URL này đã tồn tại.' });
        }

        const newSong = new SongSchema({
            title,
            artist,
            url,
            coverImage,
            genre,
        });

        const savedSong = await newSong.save();
        res.status(201).json({
            message: 'Bài hát đã được thêm thành công!',
            song: savedSong,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Có lỗi xảy ra khi thêm bài hát.',
            error: error.message,
        });
    }
});

router.get('/getsongs', async (req, res) => {
    try {
      const songs = await SongSchema.find(); 
      res.status(200).json({ songs });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách bài hát.', error });
    }
  });

  router.put('/editsong/:songId', async (req, res) => {
    const { songId } = req.params;
    const { title, artist, url, coverImage, genre } = req.body;
  
    if (!title || !artist || !url) {
      return res.status(400).json({ message: 'Các trường title, artist, và url là bắt buộc.' });
    }
  
    try {
      const updatedSong = await SongSchema.findByIdAndUpdate(
        songId,
        { title, artist, url, coverImage, genre },
        { new: true } 
      );
  
      if (!updatedSong) {
        return res.status(404).json({ message: 'Không tìm thấy bài hát.' });
      }
  
      res.status(200).json({ message: 'Chỉnh sửa bài hát thành công.', updatedSong });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi chỉnh sửa bài hát.', error });
    }
  });

  router.delete('/deletesong/:songId', async (req, res) => {
    const { songId } = req.params;
  
    try {
      const deletedSong = await SongSchema.findByIdAndDelete(songId);
  
      if (!deletedSong) {
        return res.status(404).json({ message: 'Không tìm thấy bài hát để xóa.' });
      }
  
      res.status(200).json({ message: 'Xóa bài hát thành công.', deletedSong });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa bài hát.', error });
    }
  });

module.exports = router;