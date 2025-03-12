import React from 'react';
import './sidebar.css';
import SidebarButton from './sidebarButton';
import { MdSpaceDashboard } from "react-icons/md";
import { FaFire, FaPlay, FaCloudUploadAlt } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";
import { IoLibrary } from "react-icons/io5";

export default function Sidebar({ onLogout }) {
  return (
    <div className='sidebar-container'>
        <img 
        src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQo0kBhPOp_6kAVOIMOzxPeAPwlhHi12TeIfw&s' 
        className='app-icon' 
        />
        
        <div>
            <SidebarButton title="Trang chủ" to="/" icon={<MdSpaceDashboard />} />
            <SidebarButton title="Trình phát" to="/player" icon={<FaPlay />} />
            <SidebarButton title="Hot" to="/trending" icon={<FaFire />} />
            <SidebarButton title="Cá nhân" to="/favorites" icon={<IoLibrary />} />
            <SidebarButton title="Admin" to="/admin" icon={<FaCloudUploadAlt />} />
        </div>
        <SidebarButton title="Đăng xuất" to="" icon={<FaSignOutAlt />} onLogout={onLogout} />
    </div>
  )
}
