import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';
import axios from 'axios';
import Favorites from '../favorites/favorites';
import Player from '../player/player';
import Trending from '../trending/trending';
import Library from '../library/library';
import Admin from '../admin/admin';
import './home.css';
import Sidebar from '../../components/sidebar';
import Login from '../auth/login';
import Register from '../auth/register';

export default function Home() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [songs, setSongs] = useState([]); 
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }

    axios.get('http://localhost:5000/api/song/songlist')
      .then(response => setSongs(response.data))
      .catch(error => console.error("Lỗi khi lấy danh sách bài hát:", error));
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('favorites');
    alert("Đăng xuất thành công!");
  };

  const toggleRegister = () => {
    setShowRegister(!showRegister);
  };

  const handleSelectSong = (song) => {
    const index = songs.findIndex(s => s._id === song._id);
    setCurrentSongIndex(index); 
  };

  const handleNext = () => {
    setCurrentSongIndex((currentSongIndex + 1) % songs.length); 
  };

  const handlePrevious = () => {
    setCurrentSongIndex(
      (currentSongIndex - 1 + songs.length) % songs.length 
    );
  };

  return !isAuthenticated ? (
    <Router>
      <div className="auth-container">
        {showRegister ? (
          <div>
            <Register />
            <p>
              Đã có tài khoản?{" "}
              <button onClick={toggleRegister} className="switch-btn" style={{
            color: 'white', 
            padding: '10px 15px',
            fontSize: '1rem',
            backgroundColor: '#1CC759',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
        }}>
                Đăng nhập
              </button>
            </p>
          </div>
        ) : (
          <div>
            <Login onLogin={handleLogin} />
            <p>
              Chưa có tài khoản?{" "}
              <button onClick={toggleRegister} className="switch-btn" style={{
            color: 'white', 
            padding: '10px 15px',
            fontSize: '1rem',
            backgroundColor: '#1CC759',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
        }}>
                Tạo tài khoản
              </button>
            </p>
          </div>
        )}
      </div>
    </Router>
  ) : (
    <Router>
      <div className='main-body'>
        <Sidebar onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Library onSelectSong={handleSelectSong} />} />
          <Route path="/player" element={<Player song={songs[currentSongIndex]} onPrevious={handlePrevious} onNext={handleNext} onSongChange={handleSelectSong} />} />
          <Route path="/trending" element={<Trending onSelectSong={handleSelectSong} />} />
          <Route path="/favorites" element={<Favorites onSelectSong={handleSelectSong} />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  )
}
