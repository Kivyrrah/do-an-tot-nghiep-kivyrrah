import React, { useState, useEffect } from 'react';
import './admin.css';

export default function Admin() {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [url, setUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [genre, setGenre] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  
  useEffect(() => {
    if (!isAdmin) return;

    const fetchSongs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/song/getsongs', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        if (response.ok) {
          setSongs(data.songs || []);
        } else {
          setError(data.message || 'Không thể tải danh sách bài hát.');
        }
      } catch (err) {
        setError('Lỗi kết nối tới server.');
      }
    };

    fetchSongs();
  }, [isAdmin]);

  const handleAddSong = async (e) => {
    e.preventDefault();

    if (!title || !artist || !url) {
      setError('Các trường title, artist và song URL là bắt buộc.');
      return;
    }

    const finalCoverImage =
      coverImage.trim() === ''
        ? 'https://static.4sync.com/images/4sh_music_embed_player_default_cover.png?ver=-790556520'
        : coverImage;

    try {
      const response = await fetch('http://localhost:5000/api/song/postsong', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title,
          artist,
          url,
          coverImage: finalCoverImage,
          genre,
        }),
      });

      const data = await response.json();
      if (response.ok && data.newSong) {
        setMessage(data.message || 'Thêm bài hát thành công.');
        setSongs((prevSongs) => [...prevSongs, data.newSong]);
        
        setTitle('');
        setArtist('');
        setUrl('');
        setCoverImage('');
        setGenre('');
        setError('');
      } else {
        setError(data.message || 'Lỗi khi thêm bài hát.');
      }
    } catch (err) {
      setError('Lỗi kết nối tới server.');
    }
  };

  const handleEditSong = async (songId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/song/editsong/${songId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title,
          artist,
          url,
          coverImage,
          genre,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Chỉnh sửa bài hát thành công.');
        setSongs((prevSongs) =>
          prevSongs.map((song) =>
            song._id === songId
              ? { ...song, title, artist, url, coverImage, genre }
              : song
          )
        );
        setSelectedSong(null);
      } else {
        setError(data.message || 'Lỗi khi chỉnh sửa bài hát.');
      }
    } catch (err) {
      setError('Lỗi kết nối tới server.');
    }
  };

  const handleDeleteSong = async (songId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/song/deletesong/${songId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Xóa bài hát thành công.');
        setSongs((prevSongs) => prevSongs.filter((song) => song._id !== songId));
      } else {
        setError(data.message || 'Lỗi khi xóa bài hát.');
      }
    } catch (err) {
      setError('Lỗi kết nối tới server.');
    }
  };

  
  if (!isAdmin) {
    return (
      <div className="screen-container">
        <h1>Không có quyền truy cập</h1>
        <p>Chỉ quản trị viên mới có thể truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <h1>Trang quản lý bài hát dành cho quản trị viên</h1>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      <form onSubmit={handleAddSong}>
        <h2>Tải lên bài hát</h2>
        <label>Tên bài hát</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Bắt buộc"
        />
        <label>Tên nghệ sĩ</label>
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          required
          placeholder="Bắt buộc"
        />
        <label>URL của bài hát</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          placeholder="Bắt buộc"
        />
        <label>URL của ảnh bìa</label>
        <input
          type="url"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="URL hoặc để trống"
        />
        <label>Thể loại</label>
        <input
          type="text"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="Ghi chữ Pop nếu không rõ"
        />
        <button type="submit">Thêm Bài Hát</button>
      </form>

      <h2>Danh sách bài hát</h2>
      {songs.map((song) => (
        <div key={song._id} className="song-item">
          <p>
            <b>{song.title}</b> - {song.artist}
          </p>
          <div className='actions'>
          <button className='edit-btn' onClick={() => {
            setSelectedSong(song);
            setTitle(song.title);
            setArtist(song.artist);
            setUrl(song.url);
            setCoverImage(song.coverImage);
            setGenre(song.genre);
          }}>
            Sửa
          </button>
          <button onClick={() => handleDeleteSong(song._id)}>Xóa</button>
          </div>
        </div>
      ))}

      {selectedSong && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEditSong(selectedSong._id);
          }}
        >
          <h2>Chỉnh sửa bài hát</h2>
          <label>Tên bài hát</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <label>Tên nghệ sĩ</label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
          />
          <label>URL của bài hát</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <label>URL của ảnh bìa</label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
          />
          <label>Thể loại</label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
          <button type="submit">Cập nhật bài hát</button>
          <button type="button" onClick={() => setSelectedSong(null)}>
            Hủy
          </button>
        </form>
      )}
    </div>
  );
}
