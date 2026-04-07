import React from 'react';
import { Menu, Search, Bell, Sun, LogOut } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button 
          className="icon-button" 
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>
        
        <div className="search-bar">
          <Search size={18} className="search-icon text-gray" />
          <input 
            type="text" 
            placeholder="Search employee, leave, payroll..." 
            className="search-input"
          />
        </div>
      </div>
      
      <div className="header-right">
        <button className="icon-button" aria-label="Toggle Dark Mode">
          <Sun size={20} />
        </button>
        
        <div className="notification-wrapper">
          <button className="icon-button" aria-label="Notifications">
            <Bell size={20} />
            <span className="notification-badge"></span>
          </button>
        </div>
        
        <div className="user-profile">
          <div className="avatar">
            <span>FA</span>
          </div>
          <div className="user-info">
            <span className="user-name">Fahad Aziz</span>
            <span className="user-role">HR Admin</span>
          </div>
          
          <div className="user-dropdown">
            <LogOut size={16} className="text-gray" />
            <span>Logout</span>
          </div>
        </div>
      </div>
    </header>
  );
};
