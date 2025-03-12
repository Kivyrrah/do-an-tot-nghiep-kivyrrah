import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPlay, FaPause, FaForward, FaBackward, FaRedo, FaRegHeart } from 'react-icons/fa';
import './player.css';

export default function Player({ song, onPrevious, onNext, onSongChange  }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  
  const audioRef = useRef(new Audio());
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [relatedSongs, setRelatedSongs] = useState([]);
  const [artistSongs, setArtistSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]); 
  const [showDialog, setShowDialog] = useState(false); 
  const [newPlaylistName, setNewPlaylistName] = useState(''); 
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  useEffect(() => {
    if (song && audioRef.current) {
      const audio = audioRef.current;

      if (audio.src !== song.url) {
        audio.pause(); 
        audio.src = song.url; 
        audio.load(); 
        setProgress(0); 
        setCurrentTime(0);

        if (isPlaying) {
          audio
            .play()
            .catch((error) => console.error('Lỗi:', error));
        }
      }
    }

    if (song?.genre) {
      axios
        .get(`http://localhost:5000/api/song/related?genre=${song.genre}&limit=16`)
        .then((response) => {
          const filteredSongs = response.data.filter((relatedSong) => relatedSong._id !== song._id);
          setRelatedSongs(filteredSongs);
        })
        .catch((error) => console.error('Lỗi:', error));
    }

    if (song?.artist) {
      axios
        .get(`http://localhost:5000/api/song/artist?artist=${song.artist}&limit=16`)
        .then((response) => setArtistSongs(response.data))
        .catch((error) => console.error('Lỗi:', error));
    }
  }, [song]);

  ////////////////////////////////////////

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const email = localStorage.getItem("email"); 
        if (!email) {
          console.error("Username không tồn tại trong LocalStorage");
          return;
        }
        const response = await axios.get(`http://localhost:5000/api/favorite/playlists?email=${email}`);
        setPlaylists(response.data); 
      } catch (error) {
        console.error("Lỗi khi lấy danh sách playlist:", error);
      }
    };
    fetchPlaylists();
  }, []);

  const handleAddToPlaylist = async () => {
    if (!song || (!selectedPlaylist && !newPlaylistName)) {
      alert("Vui lòng chọn playlist hoặc tạo mới!");
      return;
    }
  
    try {
      const email = localStorage.getItem("email"); 
      if (!email) {
        alert("Không tìm thấy username. Vui lòng đăng nhập lại!");
        return;
      }
  
      const payload = {
        email,
        songId: song._id,
        playlistName: newPlaylistName || selectedPlaylist.name,
      };
  
      const response = await axios.post('http://localhost:5000/api/favorite/playlists/add', payload);
      alert("Bài hát đã được thêm vào playlist thành công!");
      setShowDialog(false);
      setNewPlaylistName('');
      setSelectedPlaylist(null);
  
      if (newPlaylistName) {
        setPlaylists([...playlists, { name: newPlaylistName }]);
      }
    } catch (error) {
      console.error("Lỗi khi thêm bài hát vào playlist:", error);
      alert("Bài hát đã có trong playlist cùng tên!");
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setNewPlaylistName('');
    setSelectedPlaylist(null);
  };

  ///////////////////////////

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / duration) * 100 || 0);
    };

    if (audio) {
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration || 0);
      });

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
      };
    }
  }, [duration]);

  useEffect(() => {
    const audio = audioRef.current;

    const handleEnd = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio
          .play()
          .catch((error) => console.error('Error playing audio:', error));
      } else {
        onNext(); 
      }
    };

    if (audio) {
      audio.addEventListener('ended', handleEnd);

      return () => {
        audio.removeEventListener('ended', handleEnd);
      };
    }
  }, [isRepeat, onNext]);

  const handleRelatedSongClick = (relatedSong) => {
    if (onSongChange) {
      onSongChange(relatedSong); 
    }
  };

  const togglePlayPause = async () => {
    const audio = audioRef.current;

    if (audio) {
      if (!isPlaying) {
        try {
          await axios.put(`http://localhost:5000/api/song/${song._id}/play`);
          audio.play().catch((error) => console.error('Error playing audio:', error));
        } catch (error) {
          console.error('Lỗi khi cập nhật lượt phát:', error);
        }
      } else {
        audio.pause(); 
      }
      setIsPlaying(!isPlaying); 
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = (e.target.value / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress((newTime / duration) * 100 || 0);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!song) {
    return <div className="player-container">Chọn một bài hát để phát!</div>;
  }

  return (
    <div className="player-screen-container">
      <h1 className="player-title">{song.title}</h1>
      <img src={song.coverImage} className="player-cover" />
      <audio ref={audioRef} />

      <p className='player-artist'>Nghệ sĩ: <b>{song.artist}</b></p>

      <div className="progress-container">
        <input
          type="range"
          value={progress}
          min="0"
          max="100"
          onChange={handleSeek}
          className="progress-bar"
        />
        <div className="time-display">
          <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="controls">
        <button onClick={onPrevious}>
          <FaBackward />
        </button>

        <button onClick={togglePlayPause}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>

        <button onClick={onNext}>
          <FaForward />
        </button>

        <button onClick={() => setIsRepeat(!isRepeat)} className={isRepeat ? 'active' : ''}>
          <FaRedo />
        </button>
        
      <button className="add-to-playlist-btn" onClick={() => setShowDialog(true)}>
        <FaRegHeart />
      </button>

      
      {showDialog && (
        <div className="playlist-dialog">

          
          <div>
            <h3>Chọn playlist</h3>
            {playlists.map((playlist) => (
              <label key={playlist.name}>
                <input
                  type="radio"
                  name="playlist"
                  value={playlist.name}
                  onChange={() => setSelectedPlaylist(playlist)}
                />
                {playlist.name}
              </label>
            ))}
          </div>

          <div>
            <h3>Hoặc tạo playlist mới</h3>
            <input
              type="text"
              value={newPlaylistName}
              placeholder="Nhập tên playlist mới"
              onChange={(e) => setNewPlaylistName(e.target.value)}
            />
          </div>

          <div className="dialog-actions">
            <button onClick={handleAddToPlaylist}>Lưu</button>
            <button onClick={handleDialogClose}>Hủy</button>
          </div>
        </div>
      )}
      </div>

      <b>Gợi ý một số bài hát cùng thể loại:</b>
      <div className="related-song-list">
        {relatedSongs.map((relatedSong) => (
          <div
            key={relatedSong._id}
            className="related-song-card"
            onClick={() => handleRelatedSongClick(relatedSong)}
          >
            <img src={relatedSong.coverImage} alt={relatedSong.title} className="related-song-cover" />
            <b className="related-song-title">{relatedSong.title}</b>
            <p className="related-song-artist">{relatedSong.artist}</p>
          </div>
        ))}
      </div>

      <p>Tất cả bài hát của <b>{song.artist}</b></p>
      <div className="related-song-list">
        {artistSongs.map((artistSong) => (
          <div
            key={artistSong._id}
            className="related-song-card"
            onClick={() => handleRelatedSongClick(artistSong)} 
          >
            <img src={artistSong.coverImage} alt={artistSong.title} className="related-song-cover" />
            <b className="related-song-title">{artistSong.title}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
