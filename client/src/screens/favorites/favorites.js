import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdDeleteForever, MdOutlineExpandMore, MdOutlineExpandLess, MdOutlineHeartBroken } from 'react-icons/md';
import './favorites.css';

export default function Favorites({ onSelectSong }) {
  const [playlists, setPlaylists] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [expandedPlaylists, setExpandedPlaylists] = useState({});
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSongClick = (song) => {
    onSelectSong(song);
    setSelectedSongId(song._id);
  };

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const email = localStorage.getItem('email');
        if (!email) {
          console.error('Username không tồn tại trong LocalStorage');
          return;
        }
        const response = await axios.get(`http://localhost:5000/api/favorite/playlists-show?email=${email}`);
        if (Array.isArray(response.data)) {
          setPlaylists(response.data);
        } else {
          console.error('Dữ liệu playlists không hợp lệ:', response.data);
          setPlaylists([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách playlist:', error);
        setPlaylists([]);
      }
    };
    fetchPlaylists();
  }, []);


  const handleRemoveAccount = async () => {
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }

    try {
      const response = await axios.delete('http://localhost:5000/api/auth/delete-account', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data: { password },
      });

      if (response.status === 200) {
        setSuccessMessage(response.data.message);
        localStorage.clear();
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Lỗi không xác định');
    }
  };


  const handleRemovePlaylist = async () => {
    if (!playlistToDelete) return;

    try {
      setPlaylists((prevPlaylists) =>
        prevPlaylists.filter((playlist) => playlist._id !== playlistToDelete)
      );
      await axios.delete(`http://localhost:5000/api/favorite/playlists/${playlistToDelete}`);
      setPlaylistToDelete(null);
    } catch (error) {
      console.error('Lỗi khi xóa playlist:', error);
    }
  };

  const handleRemoveSongFromPlaylist = async (playlistId, songId) => {
    try {
      setPlaylists((prevPlaylists) =>
        prevPlaylists.map((playlist) => {
          if (playlist._id === playlistId) {
            return {
              ...playlist,
              songs: playlist.songs.filter((song) => song._id !== songId),
            };
          }
          return playlist;
        })
      );
      await axios.delete(`http://localhost:5000/api/favorite/playlists/${playlistId}/song/${songId}`);
    } catch (error) {
      console.error('Lỗi khi xóa bài hát khỏi playlist:', error);
    }
  };

  const toggleExpandPlaylist = (playlistId) => {
    setExpandedPlaylists((prevState) => ({
      ...prevState,
      [playlistId]: !prevState[playlistId],
    }));
  };

  return (
    <div className="screen-container">
      <h1>Các danh sách nhạc đã lưu</h1>

      <button className="delete-account-btn" onClick={() => setDeleteDialogOpen(true)}>
        Xóa Tài Khoản
      </button>

      {deleteDialogOpen && (
        <div className="delete-account-dialog">
          <h2>Xóa tài khoản</h2>
          <p>Vui lòng nhập mật khẩu để xác nhận:</p>
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="dialog-buttons">
            <button className='confirm-btn' onClick={handleRemoveAccount}>Xác nhận</button>
            <button className='cancel-btn' onClick={() => setDeleteDialogOpen(false)}>Hủy</button>
          </div>
        </div>
      )}

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}



      {Array.isArray(playlists) && playlists.length === 0 ? (
        <p>Chưa có danh sách nhạc nào.</p>
      ) : (
        <div className="favorite-playlist-list">
          {playlists.map((playlist) => {
            const isExpanded = expandedPlaylists[playlist._id] || false;
            const displayedSongs = isExpanded ? playlist.songs : playlist.songs.slice(0, 5);

            return (
              <div key={playlist._id} className="favorite-playlist-card">
                <h2>
                  {playlist.name}
                  <button className="toggle-playlist-btn" onClick={() => toggleExpandPlaylist(playlist._id)}>
                    {isExpanded ? <MdOutlineExpandLess /> : <MdOutlineExpandMore />}
                  </button>
                  <button className="delete-playlist-btn" onClick={() => setPlaylistToDelete(playlist._id)}>
                  <MdDeleteForever />
                  </button>
                </h2>
                {playlistToDelete === playlist._id && (
                  <div className="confirmation-dialog">
                    <p>Bạn có chắc chắn muốn xóa danh sách nhạc này không?</p>
                    <button className="confirm-btn" onClick={handleRemovePlaylist}>
                      Xác nhận
                    </button>
                    <button className="cancel-btn" onClick={() => setPlaylistToDelete(null)}>
                      Hủy
                    </button>
                  </div>
                )}
                <div className="favorite-song-list">
                  {displayedSongs.length === 0 ? (
                    <p>Chưa có bài hát nào trong danh sách nhạc này.</p>
                  ) : (
                    displayedSongs.map((song) => (
                      <div
                        key={song._id}
                        className={`favorite-song-card ${selectedSongId === song._id ? 'selected' : ''}`}
                        onClick={() => handleSongClick(song)}
                      >
                        <img src={song.coverImage} alt={song.title} className="favorite-song-cover" />
                        <div className="favorite-song-info">
                          <b>{song.title}</b>
                          <p>{song.artist}</p>
                          <button
                            className="delete-song-btn"
                            onClick={() => handleRemoveSongFromPlaylist(playlist._id, song._id)}
                          >
                            <MdOutlineHeartBroken />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
