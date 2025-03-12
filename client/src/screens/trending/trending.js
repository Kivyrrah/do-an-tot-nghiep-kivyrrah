import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import './trending.css';

export default function Trending({ onSelectSong }) {
  const [topSongs, setTopSongs] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState(null); 
  const navigate = useNavigate();
  
  const handleSongClick = (song) => {
    onSelectSong(song);
    setSelectedSongId(song._id);
    navigate('/player');
  };

  useEffect(() => {

    axios.get('http://localhost:5000/api/song/top-songs')
      .then((response) => setTopSongs(response.data))
      .catch((error) => console.error("Error fetching top songs:", error));
  }, []);

  return (
    <div className="screen-container">
      
      <h1>Bài hát được nghe nhiều nhất</h1>
      <div className="top-song-list">        
          {topSongs.map((song) => (
            <div
            key={song._id}
            className={`top-song-card ${selectedSongId === song._id ? 'selected' : ''}`} 
            onClick={() => handleSongClick(song)}
          >
            <img src={song.coverImage} alt={song.title} className="top-song-cover" />
            <b className="top-song-title">{song.title}</b>
            <p>Nghệ sĩ: {song.artist}</p>
            <p>Thể loại: {song.genre}</p>
            <p>Lượt phát: {song.playCount}</p>
          </div>
          ))}
        
      </div>
    </div>
  );
}
