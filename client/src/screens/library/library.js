import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import './library.css';

export default function Library({ onSelectSong, onNavigate }) {
  const [songs, setSongs] = useState([]);
  const [songCount, setSongCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [genre, setGenre] = useState('');
  const [searchBy, setSearchBy] = useState('title'); 
  const [selectedSongId, setSelectedSongId] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/song/songlist');
        setSongs(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bài hát:', error);
      }
    };

    const fetchSongCount = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/song/songcount');
        setSongCount(response.data.count);
      } catch (err) {
        console.error('Error fetching song count:', err);
      }
    };

    fetchSongs();
    fetchSongCount();
  }, []);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchQuery(term);
    filterSongs(term, genre, searchBy);
  };

  const handleGenreChange = (e) => {
    const selectedGenre = e.target.value;
    setGenre(selectedGenre);
    filterSongs(searchQuery, selectedGenre, searchBy);
  };

  const handleSearchByChange = (e) => {
    const selection = e.target.value;
    setSearchBy(selection);
    filterSongs(searchQuery, genre, selection);
  };

  const filterSongs = (term, genre, searchBy) => {
    const filtered = songs.filter((song) => {
      const matchesSearch = searchBy === 'title'
        ? song.title.toLowerCase().includes(term.toLowerCase())
        : song.artist.toLowerCase().includes(term.toLowerCase());

      const matchesGenre = genre ? song.genre === genre : true;
      return matchesSearch && matchesGenre;
    });
    setFilteredSongs(filtered);
  };

  const handleSongClick = (song) => {
    onSelectSong(song);
    setSelectedSongId(song._id); 
    navigate('/player');
  };

  useEffect(() => {
    const applyFilter = () => {
      if (!searchQuery && !genre) {
        setFilteredSongs(songs);
      } else {
        setFilteredSongs(
          songs.filter((song) =>
            (song.title.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery) &&
            (song.genre === genre || !genre) ||
            (song.artist.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery) &&
            (song.genre === genre || !genre)
          )
        );
      }
    };
    applyFilter();
  }, [searchQuery, genre, songs]);

  return (
    <div className="screen-container">
      <h1>Thư viện bài hát</h1><p>(Tổng cộng {songCount} bài hát)</p>

      <div className="search-container">
        <input
          type="text"
          placeholder="Tìm bài hát hoặc nghệ sĩ..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      <select value={genre} onChange={handleGenreChange}>
        <option value="">Tất cả thể loại</option>
        <option value="Pop">Pop</option>
        <option value="Rock">Rock</option>
        <option value="EDM">EDM</option>
        <option value="Classical">Cổ điển</option>
      </select>

      <div className="search-song-list">
        {filteredSongs.length > 0 ? (
          filteredSongs.map((song) => (
            <div
              key={song._id}
              className={`search-song-card ${selectedSongId === song._id ? 'selected' : ''}`} 
              onClick={() => handleSongClick(song)}
            >
              <img src={song.coverImage} alt={song.title} className="search-song-cover" />
              <b className="search-song-title">{song.title}</b>
              <p>Nghệ sĩ: {song.artist}</p>
              <p>Thể loại: {song.genre}</p>
            </div>
          ))
        ) : (
          <p>Không tìm thấy bài hát.</p>
        )}
      </div>
    </div>
  );
}
